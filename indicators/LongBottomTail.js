const Indicator = require("../indicator");

class LongBottomTail extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.currentCandle = undefined;
    }

    getName()
    {
        return "LongBottomTail";
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
        var bottomTail = Math.min(this.currentCandle.c, this.currentCandle.o) - this.currentCandle.l;

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

        return true;
    }
}

module.exports = LongBottomTail;