const express = require("express");
const router = express.Router();
const index = require("./db/index");
var moment = require('moment-timezone');
const axios = require('axios');

const RuleFactory = require("./ruleFactory");

const db = index.db;

router.post("/run_livetest", async (req, res, next) => {
    let strategyID = req.body.strategyID;
    let currentDate = req.body.currentDate;

    let temp = await getParams(strategyID);
    let dateForPreviousClosePrices = temp.dateForPreviousClosePrices;
    let strategyParams = temp.strategyParams;
    let previousBacktestResults = temp.previousBacktestResults;
    let hasErrors = temp.hasErrors;

    if (hasErrors == true)
    {
        console.log("Error when getting livetest params for strategyID: " + strategyID);
        return res.status(200).json({
            response: "Error"
        });
    }

    try
    {
        console.log("Running livetest for strategyID: " + strategyID);
        let livetestResults = await runLivetest(strategyParams, previousBacktestResults, dateForPreviousClosePrices, currentDate);
        updateDatabase(livetestResults, strategyID);
        console.log("Finished livetest for strategyID: " + strategyID);
    }
    catch
    {
        console.log("Error when running live test for strategyID: " + strategyID);
    }

    return res.status(200).json({
        response: "Success"
    });
});

async function runLivetest(strategyParams, previousBacktestResults, dateForPreviousClosePrices, currentDate)
{
    let maxTradeDuration = parseFloat(strategyParams.maxTradeDuration);
    let initialEntryRules = strategyParams.entryConditions;
    let initialExitRules = strategyParams.exitConditions;
    let symbol = strategyParams.symbol;
    let timeframe = parseInt(strategyParams.timeframe);
    let profitTarget = parseFloat(strategyparams.profitTarget);
    let stopLoss = parseFloat(strategyParams.stopLoss);

    let priceHistory = {};
    var entryBars = new Map();
    let previousDayClosePrices = new Map();

    let accountHistory = previousBacktestResults.accountHistory;
    let currentAccountValue = accountHistory[accountHistory.length - 1];
    let losses = previousBacktestResults.losses;
    let wins = previousBacktestResults.wins;
    let orders = previousBacktestResults.orders;
    let numWins = wins.length;
    let numLosses = losses.length;
    let maxDrawdown = previousBacktestResults.maxDrawdown / 100;
    let alpha = previousBacktestResults.alpha;

    let ROIs = previousBacktestResults.ROIs;
    let startingAccountValue = previousBacktestResults.startingAccountValue;
    let currentMonth = previousBacktestResults.currentMonth;

    let currentPositionSize = previousBacktestResults.currentPositionSize;
    let currentPositionEntryPrice = previousBacktestResults.currentPositionEntryPrice;
    let currentPositionEntryTime = previousBacktestResults.currentPositionEntryTime;
    let currentPositionTradeDuration = previousBacktestResults.currentPositionTradeDuration;

    let oldAccountValue = currentAccountValue;

    var peak = previousBacktestResults.peak;
    var bottom = previousBacktestResults.bottom;

    let numberOfPositions = 0;
    let numberOfDays = previousBacktestResults.numberOfDays;

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

    let priceHistory = await getPriceHistory(symbol, currentDate, timeframe);

    numberOfDays++;
    let month = currentDate.split("-")[1];

    if (month != currentMonth)
    {
        let change = currentAccountValue - startingAccountValue;
        let roi = (100.0 * change) / startingAccountValue;
        ROIs.push(roi);
        startingAccountValue = currentAccountValue;
        currentMonth = month;
    }

    for (var i = 0; i < priceHistory.length; i++)
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
            entryRules[k].update(priceHistory[i]);

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
                currentPositionSize = Math.floor(currentAccountValue / priceHistory[i].c);
                currentPositionObject = enterPosition(symbol, currentPositionSize, priceHistory[i].t, priceHistory[i].c);
            }
        }

        var meetsExitConditions = false;
        // loop through exit rules
        for (var k = 0; k < exitRules.length; k+=1)
        {
            // update each exit rule with the current bar
            exitRules[k].update(priceHistory[i]);

            // check if an exit condition is met
            if (exitRules[k].checkConditions())
            {
                meetsExitConditions = true;
            }
        }

        //Check if profit target met
        if (currentPositionSize > 0 && priceHistory[i].c >= (1 + (0.01 * profitTarget)) * currentPositionObject.entryPrice)
        {
            meetsExitConditions = true;
        }

        //Check if stop loss met
        if (currentPositionSize > 0 && priceHistory[i].c <= (1 - (0.01 * stopLoss)) * currentPositionObject.entryPrice)
        {
            meetsExitConditions = true;
        }

        if (meetsExitConditions || currentPositionTradeDuration >= maxTradeDuration)
        {
            // exit position
            if (currentPositionSize > 0)
            {
                currentPositionObject.exitTime = priceHistory[i].t;
                currentPositionObject.exitPrice = priceHistory[i].c;
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
    }

    if (currentPositionSize > 0)
    {
        accountHistory.push(parseFloat((currentPositionSize * priceHistory[i].c).toFixed(2)));
    }
    else
    {
        accountHistory.push(parseFloat(currentAccountValue.toFixed(2)));
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

    const reducer = (accumulator, currentValue) => accumulator + currentValue;

    let totalReturn = (100.0 * (currentAccountValue - 100000)) / 100000.0;
    let change = currentAccountValue - startingAccountValue;
    let roi = (100.0 * change) / startingAccountValue;
    ROIs[ROIs.length - 1] = roi;

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

    let todayChange = (currentAccountValue - oldAccountValue) / oldAccountValue;

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
        alpha: alpha,
        ROIs: ROIs,
        wins: wins,
        losses: losses,
        peak: peak,
        bottom: bottom,
        numberOfDays: numberOfDays,
        startingAccountValue: startingAccountValue,
        todayChange: todayChange,
        currentMonth: currentMonth,
        currentPositionTradeDuration: currentPositionTradeDuration,
        currentPositionSize: currentPositionSize,
        currentPositionEntryTime: currentPositionEntryTime,
        currentPositionEntryPrice: currentPositionEntryPrice
    }

    return output;
}
  
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
  
  
async function getPriceHistory(symbol, date, timeframe)
{
    let bars = [];
    var cloud = axios.default.create({});
    let url = 'https://api.polygon.io/v2/aggs/ticker/' + symbol + '/range/' + timeframe.toString() + '/minute/' + date + '/' + date + '?unadjusted=false&sort=asc&limit=5000&apiKey=Rm1obTikWQybL7LDoH_yYojQBrrr0SQg';
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

    return {
        bars: bars
    }
}

function convertTimestampToDateString(timestamp)
{
    var tempDate = new Date(timestamp);
    var year = tempDate.getFullYear().toString();
    var month = (tempDate.getMonth() > 8) ? (tempDate.getMonth() + 1).toString() : "0" + (tempDate.getMonth() + 1).toString();
    var day = (tempDate.getDate() > 9) ? tempDate.getDate().toString() : "0" + tempDate.getDate().toString();

    return year + "-" + month + "-" + day;
}
  
async function updateDatabase(backtestResults, strategyID)
{
    let backtestID = "";
    let currentMarketValue = -1;
    let currentPoolSize = 0;
    let yieldGenerated = 0;
    const strategyRef = db.collection("strategies").doc(strategyID);
    const doc = await strategyRef.get().then((document) => {
    if (document.exists)
    {
        backtestID = document.data().backTestResultsID;
        currentMarketValue = document.data().currentMarketValue;
        credits = document.data().totalCredits;
        currentPoolSize = document.data().currentPoolSize;
        yieldGenerated = document.data().yieldGenerated;
    }
    });

    let todayChange = backtestResults.todayChange;

    //update the share price
    if (currentMarketValue != -1)
    {
        currentMarketValue *= (1 + todayChange);
        yieldGenerated += (currentPoolSize * todayChange);
        currentPoolSize *= (1 + todayChange);
    }

    backtestResults.strategyID = strategyID;
    const temp = db.collection('backTestResults').doc(backtestID).update(backtestResults);

    strategyRef.update({
        tradeFrequency: backtestResults.tradeFrequency,
        currentMarketValue: currentMarketValue,
        alpha: backtestResults.alpha,
        todayChange: todayChange,
        totalReturn: backtestResults.totalReturn,
        yieldGenerated: yieldGenerated,
        currentPoolSize: currentPoolSize,
        todayYieldGenerated: (currentPoolSize * todayChange)
    });
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
        return;
    }

    return SPYresults;
}

async function getParams(strategyID)
{
    let maxTradeDuration = 0.0;
    let symbol = "";
    let timeframe = 1;
    let entryConditions = [];
    let exitConditions = [];
    let backTestResultsID = "";
    let developerID = "";
    let profitTarget = 0;
    let stopLoss = 0;

    let previousBacktestResults = {};

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
            stopLoss = document.data().stopLoss;
            profitTarget = document.data().profitTarget;
        }
        else
        {
            hasErrors = true;
        }
    });

    let strategyParams = {
        maxTradeDuration: maxTradeDuration,
        symbol: symbol,
        timeframe: timeframe,
        entryConditions: entryConditions,
        exitConditions: exitConditions,
        developerID: developerID,
        profitTarget: profitTarget,
        stopLoss: stopLoss
    }

    if (backTestResultsID != "")
    {
        const backtestRef = db.collection("backTestResults").doc(backTestResultsID);
        const doc1 = await backtestRef.get().then((document) => {
            if (document.exists)
            {
                previousBacktestResults = document.data();
            }
            else
            {
                hasErrors = true;
            }
        });
    }

    let dateForPreviousClosePrices = "";
    const previousCloseRef = db.collection("marketData").doc("dates");
    const previousCloseDoc = await previousCloseRef.get().then((document) => {
        if (document.exists)
        {
            dateForPreviousClosePrices = document.data().dateForPreviousClosePrices;
        }
        else
        {
            hasErrors = true;
        }
    });

    let output = {
        strategyParams: strategyParams,
        previousBacktestResults: previousBacktestResults,
        dateForPreviousClosePrices: dateForPreviousClosePrices,
        hasErrors: hasErrors
    }

    return output;
}

module.exports = router;