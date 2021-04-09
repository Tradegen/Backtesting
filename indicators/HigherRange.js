const Indicator = require("../indicator");

class HigherRange extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.priceHistory = [];
    }

    getName()
    {
        return "HigherRange";
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

        return range;
    }
}

module.exports = HigherRange;