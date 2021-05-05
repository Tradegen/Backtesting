const Comparator = require("../comparator");

class Closes extends Comparator {
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

    checkConditions()
    {
        if (this.indicator2.getName() == "Up")
        {
            if (this.indicator1.getName() == "PreviousNCandles")
            {
                let priceHistory = this.indicator1.getValue();

                for (var i = 1; i < priceHistory.length; i++)
                {
                    if (priceHistory[i].c <= priceHistory[i - 1].c)
                    {
                        return false;
                    }
                }

                return true;
            }
            else
            {
                
                let currentCandle = this.indicator1.getValue();
                if (currentCandle == -1)
                {
                    return false;
                }
                return (currentCandle.c > currentCandle.o);
            }
        }
        else if (this.indicator2.getName() == "Down")
        {
            if (this.indicator1.getName() == "PreviousNCandles")
            {
                let priceHistory = this.indicator1.getValue();

                for (var i = 1; i < priceHistory.length; i++)
                {
                    if (priceHistory[i].c >= priceHistory[i - 1].c)
                    {
                        return false;
                    }
                }

                return true;
            }
            else
            {
                let currentCandle = this.indicator1.getValue();
                if (currentCandle == -1)
                {
                    return false;
                }
                return (currentCandle.c > currentCandle.o);
            }
        }

        return false;
    }
}

module.exports = Closes;