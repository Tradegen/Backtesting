const Indicator = require("../indicator");

class HighOfLastNMinutes extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.minutes = params[0]
      this.priceHistory = [];
    }

    getName()
    {
        return "HighOfLastNMinutes";
    }
  
    update(currentCandle) {
        this.priceHistory.push(currentCandle);
      }

    initialize(initialHistory)
    {
        return;
    }

    reset()
    {
        this.priceHistory = [];
        return;
    }

    getValue()
    {  
        if (this.priceHistory.length < this.minutes)
        {
            return -1;
        }

        let highPrice = 0;
        for (var i = this.priceHistory.length - 2; i >= this.priceHistory.length - this.minutes; i-=1)
        {
            highPrice = Math.max(this.priceHistory[i].h, highPrice);
        }

        return (this.priceHistory.length >= this.minutes) ? highPrice : -1;
    }
}

module.exports = HighOfLastNMinutes;