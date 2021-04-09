const Indicator = require("../indicator");

class HighOfLastNMinutes extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.minutes = params[0]
      this.priceHistory = [];
      this.timeframe = 1;
      this.index = 1;
    }

    getName()
    {
        return "HighOfLastNMinutes";
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

        let highPrice = 0;
        for (var i = this.priceHistory.length - 2; i >= this.priceHistory.length - this.index; i-=1)
        {
            highPrice = Math.max(this.priceHistory[i].h, highPrice);
        }

        return (this.priceHistory.length >= this.index) ? highPrice : -1;
    }
}

module.exports = HighOfLastNMinutes;