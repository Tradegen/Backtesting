const Indicator = require("../indicator");

class HighOfFirstNMinutes extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.minutes = params[0]
      this.priceHistory = [];
      this.highPrice = 0.0;
      this.latestClosePrice = -1.0;
      this.latestOpenPrice = -1.0;
      this.alreadyMetConditions = false;
      this.timeframe = 1;
      this.index = 1;
    }

    getName()
    {
        return "HighOfFirstNMinutes";
    }
  
    update(currentCandle) {
        this.priceHistory.push(currentCandle);
  
        this.latestClosePrice = currentCandle.c;
        this.latestOpenPrice = currentCandle.o;
  
        if (this.priceHistory.length <= this.index)
        {
            if (currentCandle.h > this.highPrice)
            {
                this.highPrice = currentCandle.h;
            }
        }
  
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
        this.alreadyMetConditions = false;
        this.highPrice = 0.0;
        this.latestClosePrice = -1.0;
        this.latestOpenPrice = -1.0;
        this.timeframe = 1;
        this.index = 1;
        return;
    }

    getValue()
    {
        if (this.alreadyMetConditions == true)
        {
            return -1;
        }
        
        return (this.priceHistory.length >= this.index) ? this.highPrice : -1;
    }
}

module.exports = HighOfFirstNMinutes;