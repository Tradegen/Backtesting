const Indicator = require("../indicator");

class PreviousCandleLow extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.priceHistory = [];
    }

    getName()
    {
        return "PreviousCandleLow";
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
        return (this.priceHistory.length > 1) ? this.priceHistory[this.priceHistory.length - 2].l : -1;
    }
}

module.exports = PreviousCandleLow;