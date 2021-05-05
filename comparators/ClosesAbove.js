const Comparator = require("../comparator");

class ClosesAbove extends Comparator {
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

        if (this.indicator1.getName() == "PreviousNCandles")
        {
            let priceHistory = this.indicator1.getValue();

            for (var i = 0; i < priceHistory.length; i++)
            {
                if (priceHistory[i].c <= indicator2Value)
                {
                    return false;
                }
            }

            return true;
        }

        if (currentCandle.c > indicator2Value && this.indicator2.getName() == "HighOfFirstNMinutes")
        {
            this.indicator2.alreadyMetConditions = true;
        }

        return (currentCandle.c > indicator2Value);
    }
}

module.exports = ClosesAbove;