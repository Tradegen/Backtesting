const express = require("express");
const router = express.Router();
const index = require("./db/index");
var moment = require('moment-timezone');
const axios = require('axios');

const RuleFactory = require("./ruleFactory");

const db = index.db;

const API_KEY = "";

router.post("/run_backtest", async (req, res, next) => {
    let userID = req.body.userID;
    let strategyID = req.body.strategyID;

    let strategyParams = await getStrategyparams(strategyID);

    if (userID != strategyParams.developerID)
    {
        console.log("userID does not match developerID");
        return;
    }

    if (strategyParams.backTestResultsID != "")
    {
        console.log("already ran backtest for strategy: " + strategyID);
        return;
    }

    if (strategyParams.hasErrors == false)
    {
        try
        {
           console.log("running backtest for strategy: " + strategyID);

            let availableDates = strategyParams.availableDates;

            let backtestResults = await runBacktest(strategyParams, availableDates);

            updateDatabase(backtestResults, strategyID, false);

            console.log("backtest complete for strategy: " + strategyID);
        }
        catch
        {
            console.log("error in backtest for strategy: " + strategyID);
            updateDatabase({}, strategyID, true);
        }
    }

    return;
});
  
function enterPosition(symbol, size, time, price)
{
    var temp = {
        date: convertTimestampToDateString(time),
        symbol: symbol,
        size: size,
        entryPrice: price,
        entryTime: time,
        exitTime: 0,
        exitPrice: -1,
        profit: 0,
        roi: 0
    }

    return temp;
}
  
async function updateDatabase(backtestResults, strategyID, hasErrors)
{
    if (hasErrors == true)
    {
        const errorRef = db.collection("strategies").doc(strategyID).update({
            status: "Backtest contains errors"
        });

        return;
    }
    var modifiedBacktestResults = backtestResults;
    modifiedBacktestResults.strategyID = strategyID;
    const temp = await db.collection('backTestResults').add(modifiedBacktestResults);

    let backtestID = temp.id;
    const ref = db.collection("strategies").doc(strategyID).update({
        backTestResultsID: backtestID,
        tradeFrequency: modifiedBacktestResults.tradeFrequency,
        alpha: modifiedBacktestResults.alpha,
        totalReturn: modifiedBacktestResults.totalReturn,
        status: "Backtest complete"
    });

    console.log("the backtest ID is: " + backtestID);
}

async function getStrategyparams(strategyID)
{
    let symbol = "";
    let timeframe = 1;
    let maxTradeDuration = 0;
    let entryConditions = [];
    let exitConditions = [];
    let backTestResultsID = "";
    let developerID = "";
    let profitTarget = 0;
    let stopLoss = 0;

    let hasErrors = false;

    const strategyRef = db.collection("strategies").doc(strategyID);
    const doc1 = await strategyRef.get().then((document) => {
        if (document.exists)
        {
            maxTradeDuration = document.data().maxTradeDuration;
            symbol = document.data().underlyingAsset;
            timeframe = document.data().timeframe;
            entryConditions = document.data().entryConditions;
            exitConditions = document.data().exitConditions;
            backTestResultsID = document.data().backTestResultsID;
            developerID = document.data().developerID;
            profitTarget = document.data().profitTarget;
            stopLoss = document.data().stopLoss;
        }
        else
        {
            hasErrors = true;
        }
    });

    if (backTestResultsID == "")
    {
        const strategyTemp = await strategyRef.update({status: "Running backtest"});
    }

    let output = {
        maxTradeDuration: maxTradeDuration,
        symbol: symbol,
        timeframe: timeframe,
        entryConditions: entryConditions,
        exitConditions: exitConditions,
        hasErrors: hasErrors,
        backTestResultsID: backTestResultsID,
        developerID: developerID,
        profitTarget: profitTarget,
        stopLoss: stopLoss
    }

    return output;
}

async function getSPYHistory(date)
{
    var SPYresults = [];
    var cloud = axios.default.create({});
    let url = 'https://api.polygon.io/v2/aggs/ticker/SPY/range/1/month/2019-12-01/' + date + '?unadjusted=false&sort=asc&limit=5000&apiKey=Rm1obTikWQybL7LDoH_yYojQBrrr0SQg';
    try 
    {
        let res2 = await cloud.get(url).then(function (data) {
            let results = data.data.results;

            SPYresults = results;
        });
    } 
    catch (err) 
    {
        console.log(err);
        return;
    }

    return SPYresults;
}

function convertTimestampToDateString(timestamp)
{
    var tempDate = new Date(timestamp);
    var year = tempDate.getFullYear().toString();
    var month = (tempDate.getMonth() > 8) ? (tempDate.getMonth() + 1).toString() : "0" + (tempDate.getMonth() + 1).toString();
    var day = (tempDate.getDay() > 8) ? (tempDate.getDay() + 1).toString() : "0" + (tempDate.getDay() + 1).toString();

    return year + "-" + month + "-" + day;
}

async function runBacktest(strategyParams, availableDates)
{
    let maxTradeDuration = parseFloat(strategyParams.maxTradeDuration);
    let initialEntryRules = strategyParams.entryConditions;
    let initialExitRules = strategyParams.exitConditions;
    let symbol = strategyParams.symbol;
    let timeframe = parseInt(strategyParams.timeframe);
    let profitTarget = parseFloat(strategyParams.profitTarget);
    let stopLoss = parseFloat(strategyParams.stopLoss);

    let currentAccountValue = 100000;
    let accountHistory = [];
    let orders = [];
    let numWins = 0;
    let numLosses = 0;
    let maxDrawdown = 0;

    let losses = [];
    let wins = [];

    let ROIs = [];
    let startingAccountValue = 100000;
    let numberOfDays = 0;
  
    let currentPositionSize = 0;
    let currentPositionTradeDuration = 0;
    let currentPositionObject = {};
  
    //initialize entry rules
    let entryRules = [];
    for (var j = 0; j < initialEntryRules.length; j+=1)
    {
        let factory = new RuleFactory();
        entryRules.push(new factory.generateRule(initialEntryRules[j].firstIndicator, initialEntryRules[j].firstIndicatorParams, 
                                            initialEntryRules[j].secondIndicator, initialEntryRules[j].secondIndicatorParams,
                                            initialEntryRules[j].comparator));
    }
  
    //initialize exit rules
    let exitRules = [];
    for (var j = 0; j < initialExitRules.length; j+=1)
    {
        let factory2 = new RuleFactory();
        exitRules.push(new factory2.generateRule(initialExitRules[j].firstIndicator, initialExitRules[j].firstIndicator, 
                                                initialExitRules[j].secondIndicator, initialExitRules[j].secondIndicatorParams,
                                                initialExitRules[j].comparator));
    }
  
    var peak = 100000;
    var bottom = 100000;

    let initialTimestamp = 1577923200000; //2020-01-02 12AM
    let currentTimestamp = Date.now();
    let previousDayTimestamp = initialTimestamp;
    let currentMonth = 1;

    let chunks = [];
    for (var i = initialTimestamp; i < currentTimestamp; i += (86400 * 1000 * 30))
    {
        let chunk = await getChunk(symbol, i, i + (86400 * 30 * 1000), timeframe);
        chunks = chunks.concat(chunk);
    }

    for (var i = 0; i < chunks.length; i++)
    {
        if (currentPositionSize > 0)
        {
            currentPositionTradeDuration++;
        }

        var meetsEntryConditions = true;
        // loop through entry rules
        for (var k = 0; k < entryRules.length; k+=1)
        {
            // update each entry rule with the current bar
            entryRules[k].update(chunks[i]);

            // check if all entry conditions are met
            if (!(entryRules[k].checkConditions()))
            {
                meetsEntryConditions = false;
            }
        }

        if (meetsEntryConditions && (i >= 0))
        {
            if (currentPositionSize == 0)
            {
                currentPositionTradeDuration = 0;
                currentPositionSize = Math.floor(currentAccountValue / chunks[i].c);
                currentPositionObject = enterPosition(symbol, currentPositionSize, chunks[i].t, chunks[i].c);
            }
        }

        var meetsExitConditions = false;
        // loop through exit rules
        for (var k = 0; k < exitRules.length; k+=1)
        {
            // update each exit rule with the current bar
            exitRules[k].update(chunks[i]);

            // check if an exit condition is met
            if (exitRules[k].checkConditions())
            {
                meetsExitConditions = true;
            }
        }

        //Check if profit target met
        if (currentPositionSize > 0 && chunks[i].c >= (1 + (0.01 * profitTarget)) * currentPositionObject.entryPrice)
        {
            meetsExitConditions = true;
        }

        //Check if stop loss met
        if (currentPositionSize > 0 && chunks[i].c <= (1 - (0.01 * stopLoss)) * currentPositionObject.entryPrice)
        {
            meetsExitConditions = true;
        }

        if (meetsExitConditions || currentPositionTradeDuration >= maxTradeDuration)
        {
            // exit position
            if (currentPositionSize > 0)
            {
                currentPositionObject.exitTime = chunks[i].t;
                currentPositionObject.exitPrice = chunks[i].c;
                let profit = (currentPositionObject.exitPrice - currentPositionObject.entryPrice) * currentPositionSize;
                let roi = (((currentPositionObject.exitPrice - currentPositionObject.entryPrice) * 100) / currentPositionObject.entryPrice);
                currentPositionObject.profit = parseFloat(profit.toFixed(2));
                currentPositionObject.roi = parseFloat(roi.toFixed(2));
                orders.push(currentPositionObject);

                currentAccountValue += profit;

                if (profit > 0)
                {
                    numWins += 1;
                    wins.push((100 * profit / currentAccountValue));
                }
                else
                {
                    numLosses += 1;
                    losses.push((100 * profit / currentAccountValue));
                }

                currentPositionObject = {};
                currentPositionTradeDuration = 0;
                currentPositionSize = 0;
            }
        }

        //update daily account history
        if (chunks[i].t >= previousDayTimestamp + (86400 * 1000))
        {
            if (currentPositionSize > 0)
            {
                accountHistory.push(parseFloat((currentPositionSize * chunks[i].c).toFixed(2)));
            }
            else
            {
                accountHistory.push(parseFloat(currentAccountValue.toFixed(2)));
            }
            
            previousDayTimestamp += (86400 * 1000);
            numberOfDays++;
        }

        //update monthly ROI
        if (new Date(chunks[i].t).getMonth() != currentMonth)
        {
            let change = currentAccountValue - startingAccountValue;
            let roi = (100.0 * change) / startingAccountValue;
            ROIs.push(roi);
            startingAccountValue = currentAccountValue;
            currentMonth = new Date(chunks[i].t).getMonth();
        }

        // update max drawdown
        if (currentAccountValue > peak)
        {
            peak = currentAccountValue;
            bottom = currentAccountValue;
        }
        else if (currentAccountValue < bottom)
        {
            bottom = currentAccountValue;
            var drawdown = (peak - bottom) / peak;
            maxDrawdown = Math.max(drawdown, maxDrawdown);
        }
    }
          
    const reducer = (accumulator, currentValue) => accumulator + currentValue;

    let totalReturn = (100.0 * (currentAccountValue - 100000)) / 100000.0;
    let change = currentAccountValue - startingAccountValue;
    let roi = (100.0 * change) / startingAccountValue;
    ROIs.push(roi);

    /*let SPYhistory = await getSPYHistory(availableDates[availableDates.length - 1]);
    let SPYreturns = [];

    for (var i = 1; i < SPYhistory.length; i+=1)
    {
        let change = SPYhistory[i].c - SPYhistory[i - 1].c;
        let spyROI = (100.0 * change) / SPYhistory[i - 1].c;

        SPYreturns.push(spyROI);
    }*/

    //calculate Sharpe Ratio
    let averageReturn = ROIs.reduce(reducer, 0) / ROIs.length;
    let squares = [];
    for (var i = 0; i < ROIs.length; i+=1)
    {
        let temp = (ROIs[i] - averageReturn) * (ROIs[i] - averageReturn);
        squares.push(temp);
    }
    let averageSquares = squares.reduce(reducer, 0) / squares.length;
    let standardDeviation = (averageSquares != 0) ? Math.sqrt(averageSquares) : 1;
    let sharpeRatio = (totalReturn - 20) / standardDeviation;

    let averageWin = (numWins != 0) ? wins.reduce(reducer, 0) / numWins : 0;
    let averageLoss = (numLosses != 0) ? losses.reduce(reducer, 0) / numLosses : 0;
    let accuracy = (numWins + numLosses != 0) ? (numWins / (numWins + numLosses)) * 100.0 : 0;
    let trades = numWins + numLosses;
    let tradeFrequency = (1.0 * trades) / numberOfDays;

    /*let averageSPYreturn = SPYreturns.reduce(reducer, 0) / SPYreturns.length;
    let squaresSPY = [];
    for (var i = 0; i < SPYreturns.length; i+=1)
    {
        let temp = (SPYreturns[i] - averageSPYreturn) * (SPYreturns[i] - averageSPYreturn);
        squaresSPY.push(temp);
    }
    let averageSquaresSPY = squaresSPY.reduce(reducer, 0) / squaresSPY.length;
    let standardDeviationSPY = (averageSquaresSPY != 0) ? Math.sqrt(averageSquaresSPY) : 1;

    let alpha = -1;
    if ((SPYreturns.length == ROIs.length) && (tradeFrequency > 0))
    {
        let avg = (averageReturn - averageSPYreturn) / SPYreturns.length;
        let multiplierSTD = (standardDeviation == 0) ? 1.0 : standardDeviationSPY / standardDeviation;
        let multiplierTF = (avg > 0) ? 1 / (Math.sqrt(tradeFrequency / 2)) : Math.sqrt(tradeFrequency / 2);
        alpha = avg * multiplierSTD * multiplierTF; 
    }*/

    var output = {
        orders: orders,
        accountHistory: accountHistory,
        accuracy: parseFloat(accuracy.toFixed(2)),
        averageLoss: parseFloat(averageLoss.toFixed(2)),
        averageWin: parseFloat(averageWin.toFixed(2)),
        maxDrawdown: parseFloat((maxDrawdown * 100).toFixed(2)),
        totalReturn: parseFloat(totalReturn.toFixed(2)),
        trades: trades,
        tradeFrequency: tradeFrequency,
        sharpeRatio: sharpeRatio,
        todayChange: 0,
        alpha: 0,
        ROIs: ROIs,
        wins: wins,
        losses: losses,
        peak: peak,
        bottom: bottom,
        numberOfDays: numberOfDays,
        startingAccountValue: startingAccountValue,
        currentPositionSize: currentPositionSize,
        currentPositionTradeDuration: currentPositionTradeDuration,
        currentPositionEntryPrice: currentPositionObject.entryPrice ? currentPositionObject.entryPrice : 0,
        currentPositionEntryTime: currentPositionObject.entryTime ? currentPositionObject.entryTime : 0
    }

    console.log(output);

    return output;
}

async function getChunk(symbol, start, end, timeframe)
{
    symbol = "X:" + symbol + "USD";
    let startDate = convertTimestampToDateString(start);
    let endDate = convertTimestampToDateString(end);
    console.log(startDate + " to " + endDate);
    let bars = [];
    var cloud = axios.default.create({});
    let url = 'https://api.polygon.io/v2/aggs/ticker/' + symbol + '/range/' + timeframe.toString() + '/minute/' + startDate + '/' + endDate + '?unadjusted=false&sort=asc&limit=50000&apiKey=' + API_KEY;
    try 
    {
        let res2 = await cloud.get(url).then(function (data) {
            bars = data.data.results;
        });
    } 
    catch (err) 
    {
        bars = [];
    }

    return bars;
}

module.exports = router;