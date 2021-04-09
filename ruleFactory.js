const Rule = require("./rule");

// indicators
const CurrentCandle = require("./indicators/CurrentCandle");
const SMA = require("./indicators/SMA");
const EMA = require("./indicators/EMA");
const VWAP = require("./indicators/VWAP");
const Interval = require("./indicators/Interval");
const Signal = require("./indicators/Signal");
const Gap = require("./indicators/Gap");
const PreviousNCandles = require("./indicators/PreviousNCandles");
const Up = require("./indicators/Up");
const Down = require("./indicators/Down");
const PreviousCandleHigh = require("./indicators/PreviousCandleHigh");
const PreviousCandleLow = require("./indicators/PreviousCandleLow");
const HigherVolume = require("./indicators/HigherVolume");
const LowerVolume = require("./indicators/LowerVolume");
const HigherRange = require("./indicators/HigherRange");
const LowerRange = require("./indicators/LowerRange");
const HighOfEntryBar = require("./indicators/HighOfEntryBar");
const LowOfEntryBar = require("./indicators/LowOfEntryBar");
const HighOfFirstNMinutes = require("./indicators/HighOfFirstNMinutes");
const LowOfFirstNMinutes = require("./indicators/LowOfFirstNMinutes");
const HighOfLastNMinutes = require("./indicators/HighOfLastNMinutes");
const LowOfLastNMinutes = require("./indicators/LowOfLastNMinutes");
const AtLeastNTimesRange = require("./indicators/AtLeastNTimesRange");
const AtMostNTimesRange = require("./indicators/AtMostNTimesRange");
const AtMostNTimesVolume = require("./indicators/AtMostNTimesVolume");
const AtLeastNTimesVolume = require("./indicators/AtLeastNTimesVolume");
const LongTopTail = require("./indicators/LongTopTail");
const LongBottomTail = require("./indicators/LongBottomTail");
const ProfitTarget = require("./indicators/ProfitTarget");
const StopLoss = require("./indicators/StopLoss");
const NMinutes = require("./indicators/NMinutes");
const NPercent = require("./indicators/NPercent");

// comparators
const Closes = require("./comparators/Closes");
const ClosesAbove = require("./comparators/ClosesAbove");
const ClosesBelow = require("./comparators/ClosesBelow");
const BreaksAbove = require("./comparators/BreaksAbove");
const BreaksBelow = require("./comparators/BreaksBelow");
const Has = require("./comparators/Has");
const BouncesHigherOff = require("./comparators/BouncesHigherOff");
const BouncesLowerOff = require("./comparators/BouncesLowerOff");
const FallsTo = require("./comparators/FallsTo");
const RisesTo = require("./comparators/RisesTo");
const GivenInFirst = require("./comparators/GivenInFirst");
const UpByAtLeast = require("./comparators/UpByAtLeast");
const UpByAtMost = require("./comparators/UpByAtMost");
const DownByAtLeast = require("./comparators/DownByAtLeast");
const DownByAtMost = require("./comparators/DownByAtMost");
const FallByAtLeast = require("./comparators/FallByAtLeast");
const FallByAtMost = require("./comparators/FallByAtMost");
const RiseByAtLeast = require("./comparators/RiseByAtLeast");
const RiseByAtMost = require("./comparators/RiseByAtMost");

function RuleFactory()
{
    this.generateRule = function(indicator1Name, indicator1Params, indicator2Name, indicator2Params, comparatorName)
    {
        let indicator1;
        let indicator2;
        let comparator;

        if (indicator1Name == "CurrentCandle" || indicator2Name == "CurrentCandle")
        {
            if (indicator1Name == "CurrentCandle")
            {
                indicator1 = new CurrentCandle(indicator1Params);
            }

            if (indicator2Name == "CurrentCandle")
            {
                indicator2 = new CurrentCandle(indicator2Params);
            }
        }

        if (indicator1Name == "Up" || indicator2Name == "Up")
        {
            if (indicator1Name == "Up")
            {
                indicator1 = new Up(indicator1Params);
            }

            if (indicator2Name == "Up")
            {
                indicator2 = new Up(indicator2Params);
            }
        }

        if (indicator1Name == "Down" || indicator2Name == "Down")
        {
            if (indicator1Name == "Down")
            {
                indicator1 = new Down(indicator1Params);
            }

            if (indicator2Name == "Down")
            {
                indicator2 = new Down(indicator2Params);
            }
        }

        if (indicator1Name == "SMA" || indicator2Name == "SMA")
        {
            if (indicator1Name == "SMA")
            {
                indicator1 = new SMA(indicator1Params);
            }

            if (indicator2Name == "SMA")
            {
                indicator2 = new SMA(indicator2Params);
            }
        }

        if (indicator1Name == "EMA" || indicator2Name == "EMA")
        {
            if (indicator1Name == "EMA")
            {
                indicator1 = new EMA(indicator1Params);
            }

            if (indicator2Name == "EMA")
            {
                indicator2 = new EMA(indicator2Params);
            }
        }

        if (indicator1Name == "VWAP" || indicator2Name == "VWAP")
        {
            if (indicator1Name == "VWAP")
            {
                indicator1 = new VWAP(indicator1Params);
            }

            if (indicator2Name == "VWAP")
            {
                indicator2 = new VWAP(indicator2Params);
            }
        }

        if (indicator1Name == "Interval" || indicator2Name == "Interval")
        {
            if (indicator1Name == "Interval")
            {
                indicator1 = new Interval(indicator1Params);
            }

            if (indicator2Name == "Interval")
            {
                indicator2 = new Interval(indicator2Params);
            }
        }

        if (indicator1Name == "PreviousCandleHigh" || indicator2Name == "PreviousCandleHigh")
        {
            if (indicator1Name == "PreviousCandleHigh")
            {
                indicator1 = new PreviousCandleHigh(indicator1Params);
            }

            if (indicator2Name == "PreviousCandleHigh")
            {
                indicator2 = new PreviousCandleHigh(indicator2Params);
            }
        }

        if (indicator1Name == "PreviousCandleLow" || indicator2Name == "PreviousCandleLow")
        {
            if (indicator1Name == "PreviousCandleLow")
            {
                indicator1 = new PreviousCandleLow(indicator1Params);
            }

            if (indicator2Name == "PreviousCandleLow")
            {
                indicator2 = new PreviousCandleLow(indicator2Params);
            }
        }

        if (indicator1Name == "HigherVolume" || indicator2Name == "HigherVolume")
        {
            if (indicator1Name == "HigherVolume")
            {
                indicator1 = new HigherVolume(indicator1Params);
            }

            if (indicator2Name == "HigherVolume")
            {
                indicator2 = new HigherVolume(indicator2Params);
            }
        }

        if (indicator1Name == "LowerVolume" || indicator2Name == "LowerVolume")
        {
            if (indicator1Name == "LowerVolume")
            {
                indicator1 = new LowerVolume(indicator1Params);
            }

            if (indicator2Name == "LowerVolume")
            {
                indicator2 = new LowerVolume(indicator2Params);
            }
        }

        if (indicator1Name == "LowerRange" || indicator2Name == "LowerRange")
        {
            if (indicator1Name == "LowerRange")
            {
                indicator1 = new LowerRange(indicator1Params);
            }

            if (indicator2Name == "LowerRange")
            {
                indicator2 = new LowerRange(indicator2Params);
            }
        }

        if (indicator1Name == "HigherRange" || indicator2Name == "HigherRange")
        {
            if (indicator1Name == "HigherRange")
            {
                indicator1 = new HigherRange(indicator1Params);
            }

            if (indicator2Name == "HigherRange")
            {
                indicator2 = new HigherRange(indicator2Params);
            }
        }

        if (indicator1Name == "HighOfEntryBar" || indicator2Name == "HighOfEntryBar")
        {
            if (indicator1Name == "HighOfEntryBar")
            {
                indicator1 = new HighOfEntryBar(indicator1Params);
            }

            if (indicator2Name == "HighOfEntryBar")
            {
                indicator2 = new HighOfEntryBar(indicator2Params);
            }
        }

        if (indicator1Name == "LowOfEntryBar" || indicator2Name == "LowOfEntryBar")
        {
            if (indicator1Name == "LowOfEntryBar")
            {
                indicator1 = new LowOfEntryBar(indicator1Params);
            }

            if (indicator2Name == "LowOfEntryBar")
            {
                indicator2 = new LowOfEntryBar(indicator2Params);
            }
        }

        if (indicator1Name == "HighOfFirstNMinutes" || indicator2Name == "HighOfFirstNMinutes")
        {
            if (indicator1Name == "HighOfFirstNMinutes")
            {
                indicator1 = new HighOfFirstNMinutes(indicator1Params);
            }

            if (indicator2Name == "HighOfFirstNMinutes")
            {
                indicator2 = new HighOfFirstNMinutes(indicator2Params);
            }
        }

        if (indicator1Name == "LowOfFirstNMinutes" || indicator2Name == "LowOfFirstNMinutes")
        {
            if (indicator1Name == "LowOfFirstNMinutes")
            {
                indicator1 = new LowOfFirstNMinutes(indicator1Params);
            }

            if (indicator2Name == "LowOfFirstNMinutes")
            {
                indicator2 = new LowOfFirstNMinutes(indicator2Params);
            }
        }

        if (indicator1Name == "HighOfLastNMinutes" || indicator2Name == "HighOfLastNMinutes")
        {
            if (indicator1Name == "HighOfLastNMinutes")
            {
                indicator1 = new HighOfLastNMinutes(indicator1Params);
            }

            if (indicator2Name == "HighOfLastNMinutes")
            {
                indicator2 = new HighOfLastNMinutes(indicator2Params);
            }
        }

        if (indicator1Name == "LowOfLastNMinutes" || indicator2Name == "LowOfLastNMinutes")
        {
            if (indicator1Name == "LowOfLastNMinutes")
            {
                indicator1 = new LowOfLastNMinutes(indicator1Params);
            }

            if (indicator2Name == "LowOfLastNMinutes")
            {
                indicator2 = new LowOfLastNMinutes(indicator2Params);
            }
        }

        if (indicator1Name == "AtLeastNTimesRange" || indicator2Name == "AtLeastNTimesRange")
        {
            if (indicator1Name == "AtLeastNTimesRange")
            {
                indicator1 = new AtLeastNTimesRange(indicator1Params);
            }

            if (indicator2Name == "AtLeastNTimesRange")
            {
                indicator2 = new AtLeastNTimesRange(indicator2Params);
            }
        }

        if (indicator1Name == "AtMostNTimesRange" || indicator2Name == "AtMostNTimesRange")
        {
            if (indicator1Name == "AtMostNTimesRange")
            {
                indicator1 = new AtMostNTimesRange(indicator1Params);
            }

            if (indicator2Name == "AtMostNTimesRange")
            {
                indicator2 = new AtMostNTimesRange(indicator2Params);
            }
        }

        if (indicator1Name == "AtMostNTimesVolume" || indicator2Name == "AtMostNTimesVolume")
        {
            if (indicator1Name == "AtMostNTimesVolume")
            {
                indicator1 = new AtMostNTimesVolume(indicator1Params);
            }

            if (indicator2Name == "AtMostNTimesVolume")
            {
                indicator2 = new AtMostNTimesVolume(indicator2Params);
            }
        }

        if (indicator1Name == "AtLeastNTimesVolume" || indicator2Name == "AtLeastNTimesVolume")
        {
            if (indicator1Name == "AtLeastNTimesVolume")
            {
                indicator1 = new AtLeastNTimesVolume(indicator1Params);
            }

            if (indicator2Name == "AtLeastNTimesVolume")
            {
                indicator2 = new AtLeastNTimesVolume(indicator2Params);
            }
        }

        if (indicator1Name == "LongTopTail" || indicator2Name == "LongTopTail")
        {
            if (indicator1Name == "LongTopTail")
            {
                indicator1 = new LongTopTail(indicator1Params);
            }

            if (indicator2Name == "LongTopTail")
            {
                indicator2 = new LongTopTail(indicator2Params);
            }
        }

        if (indicator1Name == "LongBottomTail" || indicator2Name == "LongBottomTail")
        {
            if (indicator1Name == "LongBottomTail")
            {
                indicator1 = new LongBottomTail(indicator1Params);
            }

            if (indicator2Name == "LongBottomTail")
            {
                indicator2 = new LongBottomTail(indicator2Params);
            }
        }

        if (indicator1Name == "ProfitTarget" || indicator2Name == "ProfitTarget")
        {
            if (indicator1Name == "ProfitTarget")
            {
                indicator1 = new ProfitTarget(indicator1Params);
            }

            if (indicator2Name == "ProfitTarget")
            {
                indicator2 = new ProfitTarget(indicator2Params);
            }
        }

        if (indicator1Name == "StopLoss" || indicator2Name == "StopLoss")
        {
            if (indicator1Name == "StopLoss")
            {
                indicator1 = new StopLoss(indicator1Params);
            }

            if (indicator2Name == "StopLoss")
            {
                indicator2 = new StopLoss(indicator2Params);
            }
        }

        if (indicator1Name == "Signal" || indicator2Name == "Signal")
        {
            if (indicator1Name == "Signal")
            {
                indicator1 = new Signal(indicator1Params);
            }

            if (indicator2Name == "Signal")
            {
                indicator2 = new Signal(indicator2Params);
            }
        }

        if (indicator1Name == "NMinutes" || indicator2Name == "NMinutes")
        {
            if (indicator1Name == "NMinutes")
            {
                indicator1 = new NMinutes(indicator1Params);
            }

            if (indicator2Name == "NMinutes")
            {
                indicator2 = new NMinutes(indicator2Params);
            }
        }

        if (indicator1Name == "Gap" || indicator2Name == "Gap")
        {
            if (indicator1Name == "Gap")
            {
                indicator1 = new Gap(indicator1Params);
            }

            if (indicator2Name == "Gap")
            {
                indicator2 = new Gap(indicator2Params);
            }
        }

        if (indicator1Name == "NPercent" || indicator2Name == "NPercent")
        {
            if (indicator1Name == "NPercent")
            {
                indicator1 = new NPercent(indicator1Params);
            }

            if (indicator2Name == "NPercent")
            {
                indicator2 = new NPercent(indicator2Params);
            }
        }

        if (indicator1Name == "PreviousNCandles" || indicator2Name == "PreviousNCandles")
        {
            if (indicator1Name == "PreviousNCandles")
            {
                indicator1 = new PreviousNCandles(indicator1Params);
            }

            if (indicator2Name == "PreviousNCandles")
            {
                indicator2 = new PreviousNCandles(indicator2Params);
            }
        }

        //comparators
        if (comparatorName == "Closes")
        {
            comparator = new Closes(indicator1, indicator2)
        }
        else if (comparatorName == "ClosesAbove")
        {
            comparator = new ClosesAbove(indicator1, indicator2)
        }
        else if (comparatorName == "ClosesBelow")
        {
            comparator = new ClosesBelow(indicator1, indicator2)
        }
        else if (comparatorName == "BreaksAbove")
        {
            comparator = new BreaksAbove(indicator1, indicator2)
        }
        else if (comparatorName == "BreaksBelow")
        {
            comparator = new BreaksBelow(indicator1, indicator2)
        }
        else if (comparatorName == "Has")
        {
            comparator = new Has(indicator1, indicator2)
        }
        else if (comparatorName == "BouncesHigherOff")
        {
            comparator = new BouncesHigherOff(indicator1, indicator2)
        }
        else if (comparatorName == "BouncesLowerOff")
        {
            comparator = new BouncesLowerOff(indicator1, indicator2)
        }
        else if (comparatorName == "FallsTo")
        {
            comparator = new FallsTo(indicator1, indicator2)
        }
        else if (comparatorName == "RisesTo")
        {
            comparator = new RisesTo(indicator1, indicator2)
        }
        else if (comparatorName == "GivenInFirst")
        {
            comparator = new GivenInFirst(indicator1, indicator2)
        }
        else if (comparatorName == "UpByAtLeast")
        {
            comparator = new UpByAtLeast(indicator1, indicator2)
        }
        else if (comparatorName == "UpByAtMost")
        {
            comparator = new UpByAtMost(indicator1, indicator2)
        }
        else if (comparatorName == "DownByAtLeast")
        {
            comparator = new DownByAtLeast(indicator1, indicator2)
        }
        else if (comparatorName == "DownByAtMost")
        {
            comparator = new DownByAtMost(indicator1, indicator2)
        }
        else if (comparatorName == "FallByAtLeast")
        {
            comparator = new FallByAtLeast(indicator1, indicator2)
        }
        else if (comparatorName == "FallByAtMost")
        {
            comparator = new FallByAtMost(indicator1, indicator2)
        }
        else if (comparatorName == "RiseByAtMost")
        {
            comparator = new RiseByAtMost(indicator1, indicator2)
        }
        else if (comparatorName == "RiseByAtLeast")
        {
            comparator = new RiseByAtLeast(indicator1, indicator2)
        }

        return new Rule(indicator1, indicator2, comparator);     
    }
}

module.exports = RuleFactory;