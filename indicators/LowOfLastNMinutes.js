const Indicator = require("../indicator");

class LowOfLastNMinutes extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.minutes = params[0]
      this.priceHistory = [];
      this.timeframe = 1;
      this.index = 1;
    }

    getName()
    {
        return "LowOfLastNMinutes";
    }
  
    update(currentCandle) {
        this.priceHistory.push(currentCandle);
  
        if ((typeof currentCandle.timeframe !== "undefined") && (currentCandle.timeframe > 0))
        {
            this.timeframe = currentCandle.timeframe;
            this.index = Math.ceil(this.minutes/this.timeframe);
        }
      }

    initialize(initialHistory)
    {
        return;
    }

    reset()
    {
        this.priceHistory = [];
        this.lowPrice = 0.0;
        this.latestClosePrice = -1.0;
        this.latestOpenPrice = -1.0;
        this.timeframe = 1;
        this.index = 1;
        return;
    }

    getValue()
    {  
        if (this.priceHistory.length < this.index)
        {
            return -1;
        }

        let lowPrice = 999999999;
        for (var i = this.priceHistory.length - 2; i >= this.priceHistory.length - this.index; i-=1)
        {
            lowPrice = Math.min(this.priceHistory[i].l, lowPrice);
        }

        return (this.priceHistory.length >= this.index) ? lowPrice : -1;
    }
}

module.exports = LowOfLastNMinutes;