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
      let maxAllocation = parseFloat(strategyParams.maxAllocation);
      let direction = strategyParams.direction;
      let startTime = parseInt(strategyParams.startTime);
      let endTime = parseInt(strategyParams.endTime);
      let initialEntryRules = strategyParams.entryConditions;
      let initialExitRules = strategyParams.exitConditions;
      let symbols = strategyParams.symbols;
      let timeframe = parseInt(strategyParams.timeframe);
      let maxConcurrentTrades = parseInt(strategyParams.maxConcurrentTrades);
  
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

      let oldAccountValue = currentAccountValue;

      let priceHistoryBySymbol = {};
        for (var i = 0; i < symbols.length; i+=1)
        {
            priceHistoryBySymbol[symbols[i]] = [];
        }
  
      //Make initial price history object
      for (var i = 0; i < (390 / timeframe); i+=1)
      {
          let tempMap = {};
  
          for (var j = 0; j < symbols.length; j+=1)
          {
              let temp = {
                  v: -1
              }
  
              tempMap[symbols[j]] = temp;

              priceHistoryBySymbol[symbols[j]].push(temp);
          }
  
          priceHistory[i.toString()] = tempMap;
      }
  
      //get initial data to generate entry/exit rules
      for (var i = 0; i < symbols.length; i+=1)
      {
            var cloud = axios.default.create({});
            let url = 'https://api.polygon.io/v2/aggs/ticker/' + symbols[i] + '/range/1/day/' + dateForPreviousClosePrices + '/' + dateForPreviousClosePrices + '?unadjusted=false&sort=asc&limit=1&apiKey=Rm1obTikWQybL7LDoH_yYojQBrrr0SQg';

            try 
            {
                let res2 = await cloud.get(url).then(function (data) {
                    initialBars = data.data.results;
                    let previousClose = (typeof initialBars[0] !== "undefined") ? initialBars[0] : -1;
  
                    previousDayClosePrices.set(symbols[i], previousClose);
                });
            } 
            catch (err) 
            {
                previousDayClosePrices.set(symbols[i], -1);
            }
      }
  
      //initialize entry rules
    let entryRules = [];
    for (var i = 0; i < symbols.length; i+=1)
    {
        let rules = [];

        for (var j = 0; j < initialEntryRules.length; j+=1)
        {
            let factory = new RuleFactory();
            rules.push(new factory.generateRule(initialEntryRules[j].firstIndicator, initialEntryRules[j].firstIndicatorParams, 
                                                initialEntryRules[j].secondIndicator, initialEntryRules[j].secondIndicatorParams,
                                                initialEntryRules[j].comparator));
        }

        entryRules.push(rules);
    }
  
      //initialize exit rules
    let exitRules = [];
    for (var i = 0; i < symbols.length; i+=1)
    {
        let rules2 = [];

        for (var j = 0; j < initialExitRules.length; j+=1)
        {
            let factory2 = new RuleFactory();
            rules2.push(new factory2.generateRule(initialExitRules[j].firstIndicator, initialExitRules[j].firstIndicator, 
                                                  initialExitRules[j].secondIndicator, initialExitRules[j].secondIndicatorParams,
                                                  initialExitRules[j].comparator));
        }

        exitRules.push(rules2);
    }
  
      var peak = previousBacktestResults.peak;
      var bottom = previousBacktestResults.bottom;
  
      let numberOfPositions = 0;
      let numberOfDays = previousBacktestResults.numberOfDays;
  
      let currentPositions = [];
  
          //initialize price history
          for (var i = 0; i < (390 / timeframe) - Math.floor(endTime / timeframe); i+=1)
          {
              for (var j = 0; j < symbols.length; j+=1)
              {
                  let temp = {
                      v: -1
                  }
  
                  priceHistory[i.toString()][symbols[j]] = temp;
              }
          }
  
          let validDate = false;
          //get price history of each symbol for the current date
          for (var i = 0; i < symbols.length; i+=1)
          {
              let temp = await getPriceHistory(symbols[i], currentDate, timeframe);

              if (temp.validDate == true)
              {
                  validDate = true;
              }
  
              for (var j = 0; j < temp.bars.length; j+=1)
              {
                  let offset = temp.bars[j].offset;
                  priceHistory[offset.toString()][symbols[i]] = temp.bars[j];
              }
          }

          if (validDate == true)
          {
              numberOfDays += 1;
              let month = currentDate.split("-")[1];

              if (month != currentMonth)
              {
                 let change = currentAccountValue - startingAccountValue;
                 let roi = (100.0 * change) / startingAccountValue;
                 ROIs.push(roi);
                 startingAccountValue = currentAccountValue;
                 currentMonth = month;
              }
          }

          // loop through each minute in the trading day between startTime and endTime
          for (var i = 0; i < (390 / timeframe) - Math.floor(endTime / timeframe); i+=1)
          {
              // loop through each symbol under consideration
              for (var j = 0; j < symbols.length; j+=1)
              {
                  //check if stock not trading for the current minute
                  if (priceHistory[i.toString()][symbols[j]].v == -1)
                  {
                      continue;
                  }
  
                  let currentBar = priceHistory[i.toString()][symbols[j]];
  
                  currentBar.direction = direction;
                  currentBar.timeframe = timeframe;
  
                  //check for gap
                  if (i == 0)
                  {
                      if (previousDayClosePrices.get(symbols[j]) != -1)
                      {
                          let previousClose = previousDayClosePrices.get(symbols[j]);
                          let gap = 0.0;
  
                          if (typeof previousClose !== "undefined")
                          {
                              gap = (100 * (currentBar.o - previousClose)) / previousClose;
                          }
  
                          currentBar.gap = gap;
                      }
                  }
  
                  var meetsEntryConditions = true;
                  // loop through entry rules
                  for (var k = 0; k < entryRules[j].length; k+=1)
                  {
                      // update each entry rule with the current bar
                      entryRules[j][k].update(currentBar);
  
                      // check if all entry conditions are met
                      if (!(entryRules[j][k].checkConditions()))
                      {
                          meetsEntryConditions = false;
                      }
                  }
  
                  if (meetsEntryConditions  && (i >= startTime))
                  {
                      var hasPosition = false;
                      // check for existing position
                      for (var k = 0; k < currentPositions.length; k+=1)
                      {
                          if (currentPositions[k].symbol == symbols[j])
                          {
                              hasPosition = true;
                          }
                      }
  
                      if (!hasPosition && (numberOfPositions < maxConcurrentTrades))
                      {
                          var price = currentBar.c;
                          var size = Math.floor(((maxAllocation/100.0 * currentAccountValue) / price) / Math.min(symbols.length, maxConcurrentTrades));
                          var temp = enterPosition(symbols[j], size, currentDate, i, price, direction);
                          currentPositions.push(temp);
                          numberOfPositions += 1;
  
                          entryBars.set(symbols[j], currentBar);
  
                          if (typeof price === "undefined")
                          {
                              console.log("price is undefined");
                          }
                      }
                  }
  
                  var meetsExitConditions = false;
                  // loop through exit rules
                  for (var k = 0; k < exitRules[j].length; k+=1)
                  {
                      if (entryBars.get(symbols[j]))
                      {
                          currentBar.entryBar = entryBars.get(symbols[j]);
                      }
  
                      // update each exit rule with the current bar
                      exitRules[j][k].update(currentBar);
  
                      // check if an exit condition is met
                      if (exitRules[j][k].checkConditions())
                      {
                          meetsExitConditions = true;
                      }
                  }
  
                  if (meetsExitConditions)
                  {
                      var hasPosition = false;
                      // check for existing position
                      let k = 0;
                      for (k = 0; k < currentPositions.length; k+=1)
                      {
                          if (currentPositions[k].symbol == symbols[j])
                          {
                              hasPosition = true;
                              break;
                          }
                      }
  
                      // exit position
                      if (hasPosition)
                      {
                          var temp = currentPositions[k];
                          var price = priceHistory[i.toString()][symbols[j]].c;
                          var multiplier = (temp.direction == "long") ? 1 : -1;
                          let size = temp.size;
                          temp.exitTime = i;
                          temp.exitPrice = price;
                          var profit = (temp.exitPrice - temp.entryPrice) * size * multiplier;
                          let roi = (((temp.exitPrice - temp.entryPrice) * 100) / temp.entryPrice) * multiplier;
                          temp.profit = parseFloat(profit.toFixed(2));
                          temp.roi = parseFloat(roi.toFixed(2));
                          orders.push(temp);
  
                          numberOfPositions -= 1;
  
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
  
                          temp = {
                              symbol: "",
                          }
                          currentPositions[k] = temp;
                      }
                  }
  
                  //clear all keys in entryBars
                  entryBars.clear();
              }
  
              // exit any remaining positions at the end of the day
              if (i == ((390 / timeframe) - Math.floor(endTime / timeframe) - 1))
              {
                  for (var k = 0; k < currentPositions.length; k+=1)
                  {
                      if (currentPositions[k].symbol != "")
                      {
                          var temp = currentPositions[k];
                          let symbol = temp.symbol;
                          let size = temp.size;
                          let price = 0.0;
  
                          var cloud = axios.default.create({});
                            let url = 'https://api.polygon.io/v2/aggs/ticker/' + symbol + '/range/1/day/' + currentDate + "/" + currentDate + '?unadjusted=false&sort=asc&limit=1&apiKey=Rm1obTikWQybL7LDoH_yYojQBrrr0SQg';

                            try 
                            {
                                let res2 = await cloud.get(url).then(function (data) {
                                    price = data.data.results[0].c;
                                });
                            } 
                            catch (err) 
                            {
                                price = currentPositions[k].entryPrice;
                            }
  
                          temp.exitTime = i;
                          temp.exitPrice = price;
                          let multiplier = (temp.direction == "long") ? 1 : -1;
                          var profit = (temp.exitPrice - temp.entryPrice) * size * multiplier;
                          let roi = (((temp.exitPrice - temp.entryPrice) * 100.0) / temp.entryPrice) * multiplier;
                          temp.profit = parseFloat(profit.toFixed(2));
                          temp.roi = parseFloat(roi.toFixed(2));
                          orders.push(temp);
  
                          numberOfPositions -= 1;
  
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
                      }
                  }
              }
          }
  
          accountHistory.push(parseFloat(currentAccountValue.toFixed(2)));
  
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
  
          //reset each rule at the end of each day
          for (var k = 0; k < symbols.length; k+=1)
          {
              for (var i = 0; i < entryRules[k].length; i+=1)
              {
                  entryRules[k][i].reset();
              }
              for (var j = 0; j < exitRules[k].length; j+=1)
              {
                  exitRules[k][j].reset();
              }
          }

      const reducer = (accumulator, currentValue) => accumulator + currentValue;

      let totalReturn = (100.0 * (currentAccountValue - 100000)) / 100000.0;
      let change = currentAccountValue - startingAccountValue;
      let roi = (100.0 * change) / startingAccountValue;
      ROIs[ROIs.length - 1] = roi;

      let SPYhistory = await getSPYHistory(currentDate);
      let SPYreturns = [];

      for (var i = 1; i < SPYhistory.length; i+=1)
      {
          let change = SPYhistory[i].c - SPYhistory[i - 1].c;
          let spyROI = (100.0 * change) / SPYhistory[i - 1].c;

          SPYreturns.push(spyROI);
      }

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
    let sharpeRatio = (totalReturn - 3.5) / standardDeviation;

    let averageWin = (numWins != 0) ? wins.reduce(reducer, 0) / numWins : 0;
    let averageLoss = (numLosses != 0) ? losses.reduce(reducer, 0) / numLosses : 0;
    let accuracy = (numWins + numLosses != 0) ? (numWins / (numWins + numLosses)) * 100.0 : 0;
    let trades = numWins + numLosses;
    let tradeFrequency = (1.0 * trades) / numberOfDays;

    let averageSPYreturn = SPYreturns.reduce(reducer, 0) / SPYreturns.length;
    let squaresSPY = [];
    for (var i = 0; i < SPYreturns.length; i+=1)
    {
        let temp = (SPYreturns[i] - averageSPYreturn) * (SPYreturns[i] - averageSPYreturn);
        squaresSPY.push(temp);
    }
    let averageSquaresSPY = squaresSPY.reduce(reducer, 0) / squaresSPY.length;
    let standardDeviationSPY = (averageSquaresSPY != 0) ? Math.sqrt(averageSquaresSPY) : 1;

    if ((SPYreturns.length == ROIs.length) && (tradeFrequency > 0))
    {
        let avg = (averageReturn - averageSPYreturn) / SPYreturns.length;
        let multiplierSTD = (standardDeviation == 0) ? 1.0 : standardDeviationSPY / standardDeviation;
        let multiplierTF = (avg > 0) ? 1 / (Math.sqrt(tradeFrequency / 2)) : Math.sqrt(tradeFrequency / 2);
        alpha = avg * multiplierSTD * multiplierTF; 
    }

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
          currentMonth: currentMonth
      }
  
      return output;
  }
  
  function enterPosition(symbol, size, date, time, price, direction)
  {
      var temp = {
          symbol: symbol,
          size: size,
          entryPrice: price,
          direction: direction,
          date: date,
          entryTime: time,
          exitTime: "",
          exitPrice: -1,
          profit: 0,
          roi: 0
      }
  
      return temp;
  }
  
  
  async function getPriceHistory(symbol, date, timeframe)
  {
    let bars = [];
    let validDate = false;
    var cloud = axios.default.create({});
    let url = 'https://api.polygon.io/v2/aggs/ticker/' + symbol + '/range/' + timeframe.toString() + '/minute/' + date + '/' + date + '?unadjusted=false&sort=asc&limit=5000&apiKey=Rm1obTikWQybL7LDoH_yYojQBrrr0SQg';
    try 
    {
        let res2 = await cloud.get(url).then(function (data) {
            let initialBars = data.data.results;
  
            let finalBars = [];

            if (initialBars.length == 0)
            {
                bars = [];
                validDate = false;
                return;
            }
            
            let x = moment.tz(date, "America/New_York").format();
            let y = Date.parse(x);
            let timestampAtMarketOpen = y + 34200000;;
    
            for (var i = 0; i < initialBars.length; i+=1)
            {
                let currentTimestamp = initialBars[i].t;
                let offset = (currentTimestamp - timestampAtMarketOpen) / (60000 * timeframe);
    
                if (offset >= 0 && offset < (390 / timeframe))
                {
                    let temp = initialBars[i];
                    temp.offset = offset;
                    bars.push(temp);
                }
            }
    
            validDate = true;
        });
    } 
    catch (err) 
    {
        bars = [];
        validDate = false;
    }

    return {
        bars: bars,
        validDate: validDate
    }
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
    let maxAllocation = 0.0;
    let direction = "";
    let startTime = 0;
    let endTime = 0;
    let symbols = [];
    let timeframe = 1;
    let maxConcurrentTrades = 0;
    let entryConditions = [];
    let exitConditions = [];
    let backTestResultsID = "";
    let developerID = "";

    let previousBacktestResults = {};

    let hasErrors = false;

    const strategyRef = db.collection("strategies").doc(strategyID);
    const doc1 = await strategyRef.get().then((document) => {
        if (document.exists)
        {
            maxAllocation = document.data().maxAllocation;
            direction = document.data().direction;
            startTime = document.data().startTime;
            endTime = document.data().endTime;
            symbols = document.data().symbols;
            timeframe = document.data().timeframe;
            maxConcurrentTrades = document.data().maxConcurrentTrades;
            entryConditions = document.data().entryConditions;
            exitConditions = document.data().exitConditions;
            backTestResultsID = document.data().backTestResultsID;
            developerID = document.data().developerID;
        }
        else
        {
            hasErrors = true;
        }
    });

    let strategyParams = {
        maxAllocation: maxAllocation,
        direction: direction,
        startTime: startTime,
        endTime: endTime,
        symbols: symbols,
        timeframe: timeframe,
        maxConcurrentTrades: maxConcurrentTrades,
        entryConditions: entryConditions,
        exitConditions: exitConditions,
        developerID: developerID
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