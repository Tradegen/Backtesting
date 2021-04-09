const Indicator = require("../indicator");

class EMA extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.period = params[0];
      this.indicatorHistory = [];
      this.priceHistory = [];
      this.currentValue = 0.0;
    }

    getName()
    {
        return "EMA";
    }
  
    update(currentCandle)
    {
        if (this.priceHistory.length == this.period)
        {
            this.priceHistory.splice(0, 1);
        }
        
        this.priceHistory.push(currentCandle.c);

        if (this.priceHistory.length < this.period)
        {
            return;
        }

        let EMAperiod = 0;
        let multiplier = 2 / (this.period + 1);
        let initialEMA = 0.0;

        for (var i = this.period; i >= 1; i-=1)
        {
            if (i == this.period)
            {
                initialEMA = this.priceHistory[this.priceHistory.length - i];
                EMAperiod = initialEMA;
            }
            else
            {
                EMAperiod = (multiplier * this.priceHistory[this.priceHistory.length - i]) + ((1 - multiplier) * initialEMA);
                initialEMA = EMAperiod;
            }
        }

        this.currentValue = EMAperiod;
        this.indicatorHistory.push(EMAperiod);
    }

    initialize(initialHistory)
    {
        let EMAperiod = 0;
        let multiplier = 2 / (this.period + 1);
        let initialEMA = 0.0;

        for (var i = this.period; i >= 1; i-=1)
        {
            if (i == this.period)
            {
                initialEMA = initialHistory[initialHistory.length - i].c;
                EMAperiod = initialEMA;
            }
            else
            {
                EMAperiod = (multiplier * initialHistory[initialHistory.length - i].c) + ((1 - multiplier) * initialEMA);
                initialEMA = EMAperiod;
            }

            this.priceHistory.push(initialHistory[initialHistory.length - i].c);
        }

        this.currentValue = EMAperiod;
        this.indicatorHistory.push(EMAperiod);

        return;
    }

    reset()
    {
        this.priceHistory = [];
        this.indicatorHistory = [];
        this.currentValue = 0.0;
        return;
    }

    getValue()
    {
        return this.currentValue;
    }
}

module.exports = EMA;