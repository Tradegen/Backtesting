const Comparator = require("../comparator");

class Has extends Comparator {
    constructor(indicator1, indicator2) {
      super(indicator1, indicator2); // call the super class constructor and pass in the name parameter
      this.indicator1 = indicator1;
      this.indicator2 = indicator2;
    }
  
    initialize() {
        return;
    }

    reset()
    {
        return;
    }

    checkConditions() {
        let currentCandle = this.indicator1.getValue();
        let indicator2Value = this.indicator2.getValue();

        if (currentCandle == -1)
        {
            return false;
        }

        if (indicator2Value == -1)
        {
            return false;
        }

        if (this.indicator2.getName() == "HigherVolume")
        {
            if (this.indicator1.getName() == "PreviousNCandles")
            {
                let priceHistory = this.indicator1.getValue();

                for (var i = 0; i < priceHistory.length; i++)
                {
                    if (priceHistory[i].v <= indicator2Value)
                    {
                        return false;
                    }
                }

                return true;
            }

            return (currentCandle.v > indicator2Value);
        }

        if (this.indicator2.getName() == "LowerVolume")
        {
            if (this.indicator1.getName() == "PreviousNCandles")
            {
                let priceHistory = this.indicator1.getValue();

                for (var i = 0; i < priceHistory.length; i++)
                {
                    if (priceHistory[i].v >= indicator2Value)
                    {
                        return false;
                    }
                }

                return true;
            }

            return (currentCandle.v < indicator2Value);
        }

        if (this.indicator2.getName() == "HigherRange")
        {
            if (this.indicator1.getName() == "PreviousNCandles")
            {
                let priceHistory = this.indicator1.getValue();

                for (var i = 0; i < priceHistory.length; i++)
                {
                    let range = priceHistory[i].h - priceHistory[i].l;
                    if (range <= indicator2Value)
                    {
                        return false;
                    }
                }

                return true;
            }

            let range = currentCandle.h - currentCandle.l;
            return (range > indicator2Value);
        }

        if (this.indicator2.getName() == "LowerRange")
        {
            if (this.indicator1.getName() == "PreviousNCandles")
            {
                let priceHistory = this.indicator1.getValue();

                for (var i = 0; i < priceHistory.length; i++)
                {
                    let range = priceHistory[i].h - priceHistory[i].l;
                    if (range >= indicator2Value)
                    {
                        return false;
                    }
                }

                return true;
            }

            let range = currentCandle.h - currentCandle.l;
            return (range < indicator2Value);
        }

        if (this.indicator2.getName() == "AtLeastNTimesRange")
        {
            if (this.indicator1.getName() == "PreviousNCandles")
            {
                let priceHistory = this.indicator1.getValue();

                for (var i = 0; i < priceHistory.length; i++)
                {
                    let range = priceHistory[i].h - priceHistory[i].l;
                    if (range < indicator2Value)
                    {
                        return false;
                    }
                }

                return true;
            }

            let range = currentCandle.h - currentCandle.l;
            return (range > indicator2Value);
        }

        if (this.indicator2.getName() == "AtMostNTimesRange")
        {
            if (this.indicator1.getName() == "PreviousNCandles")
            {
                let priceHistory = this.indicator1.getValue();

                for (var i = 0; i < priceHistory.length; i++)
                {
                    let range = priceHistory[i].h - priceHistory[i].l;
                    if (range > indicator2Value)
                    {
                        return false;
                    }
                }

                return true;
            }

            let range = currentCandle.h - currentCandle.l;
            return (range <= indicator2Value);
        }

        if (this.indicator2.getName() == "AtMostNTimesVolume")
        {
            if (this.indicator1.getName() == "PreviousNCandles")
            {
                let priceHistory = this.indicator1.getValue();

                for (var i = 0; i < priceHistory.length; i++)
                {
                    if (priceHistory[i].v > indicator2Value)
                    {
                        return false;
                    }
                }

                return true;
            }

            return currentCandle.v <= indicator2Value;
        }

        if (this.indicator2.getName() == "AtLeastNTimesVolume")
        {
            if (this.indicator1.getName() == "PreviousNCandles")
            {
                let priceHistory = this.indicator1.getValue();

                for (var i = 0; i < priceHistory.length; i++)
                {
                    if (priceHistory[i].v < indicator2Value)
                    {
                        return false;
                    }
                }

                return true;
            }

            return currentCandle.v > indicator2Value;
        }

        if (this.indicator2.getName() == "LongTopTail")
        {
            if (this.indicator1.getName() == "PreviousNCandles")
            {
                let priceHistory = this.indicator1.getValue();

                for (var i = 0; i < priceHistory.length; i++)
                {
                    var priceRange = priceHistory[i].h - priceHistory[i].l;
                    var topTail = priceHistory[i].h - Math.max(priceHistory[i].o, priceHistory[i].c);

                    // Cannot have long top tail if the candle is too small
                    if (priceRange < 0.04)
                    {
                        return false;
                    }

                    // Top tail must be at least 0.5x range
                    if (!(topTail >= 0.5 * priceRange))
                    {
                        return false;
                    }
                }

                return true;
            }

            return indicator2Value;
        }

        if (this.indicator2.getName() == "LongBottomTail")
        {
            if (this.indicator1.getName() == "PreviousNCandles")
            {
                let priceHistory = this.indicator1.getValue();

                for (var i = 0; i < priceHistory.length; i++)
                {
                    var priceRange = priceHistory[i].h - priceHistory[i].l;
                    var bottomTail = Math.min(priceHistory[i].c, priceHistory[i].o) - priceHistory[i].l;

                    // Cannot have long bottom tail if the candle is too small
                    if (priceRange < 0.04)
                    {
                        return false;
                    }

                    // Bottom tail must be at least 0.5x range
                    if (!(bottomTail >= 0.5 * priceRange))
                    {
                        return false;
                    }
                }

                return true;
            }

            return indicator2Value;
        }

        return false;
    }
}

module.exports = Has;