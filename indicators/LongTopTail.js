const Indicator = require("../indicator");

class LongTopTail extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.currentCandle = undefined;
    }

    getName()
    {
        return "LongTopTail";
    }
  
    update(currentCandle)
    {
        this.currentCandle = currentCandle;
        return;
    }

    initialize(initialHistory)
    {
        return;
    }

    reset()
    {
        this.currentCandle = undefined;
        return;
    }

    getValue()
    {
        var priceRange = this.currentCandle.h - this.currentCandle.l;
        var topTail = this.currentCandle.h - Math.max(this.currentCandle.o, this.currentCandle.c);

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

        return true;
    }
}

module.exports = LongTopTail;