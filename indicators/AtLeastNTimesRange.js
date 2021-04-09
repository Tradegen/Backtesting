const Indicator = require("../indicator");

class AtLeastNTimesRange extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.priceHistory = [];
      this.multiplier = params[0];
    }

    getName()
    {
        return "AtLeastNTimesRange";
    }
  
    update(currentCandle)
    {
        this.priceHistory.push(currentCandle);
        return;
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
        if (this.priceHistory.length < 2)
        {
            return -1;
        }

        let range = this.priceHistory[this.priceHistory.length - 2].h - this.priceHistory[this.priceHistory.length - 2].l;
        range *= this.multiplier;

        return range;
    }
}

module.exports = AtLeastNTimesRange;