const Indicator = require("../indicator");

class VWAP extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.period = params[0];
      this.indicatorHistory = [];
      this.priceHistory = [];
      this.currentValue = 0.0;
      this.cumulativeVolume = 0.0;
    }

    getName()
    {
        return "VWAP";
    }
  
    update(currentCandle)
    {
        let value = 0.0;

        if (this.priceHistory.length < this.period)
        {
            value = ((this.cumulativeVolume * this.currentValue) + (currentCandle.v * currentCandle.c)) / (this.cumulativeVolume + currentCandle.v);
            this.cumulativeVolume += currentCandle.v;
        }
        else if (this.priceHistory.length == this.period)
        {
            value = ((this.cumulativeVolume * this.currentValue) + (currentCandle.v * currentCandle.c) - (this.priceHistory[0].v * this.priceHistory[0].c)) / (this.cumulativeVolume + currentCandle.v - this.priceHistory[0].v);
            this.cumulativeVolume = this.cumulativeVolume - this.priceHistory[0].v + currentCandle.v;
        }

        this.currentValue = value;
        this.indicatorHistory.push(value);

        if (this.priceHistory.length == this.period)
        {
            this.priceHistory.splice(0, 1);
        }

        this.priceHistory.push(currentCandle);
    }

    initialize(initialHistory)
    {
        let sumOfPricesAndVolumes = 0.0;
        let sumOfVolumes = 0.0;

        for (var i = self.period; i >= 1; i-=1)
        {
            sumOfPricesAndVolumes += initialHistory[initialHistory.length - i].c * initialHistory[initialHistory.length - i].v;
            sumOfVolumes += initialHistory[initialHistory.length - i].v;
            this.priceHistory.push(initialHistory[initialHistory.length - i]);
        }

        this.cumulativeVolume = sumOfVolumes;
        let value = sumOfPricesAndVolumes / sumOfVolumes;
        this.currentValue = value;
        this.indicatorHistory.push(value);

        return;
    }

    reset()
    {
        this.priceHistory = [];
        this.indicatorHistory = [];
        this.currentValue = 0.0;
        this.cumulativeVolume = 0.0;
        return;
    }

    getValue()
    {
        return this.currentValue;
    }
}

module.exports = VWAP;