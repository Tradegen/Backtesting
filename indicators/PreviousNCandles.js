const Indicator = require("../indicator");

class PreviousNCandles extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.priceHistory = [];
      this.amount = params[0];
    }

    getName()
    {
        return "PreviousNCandles";
    }
  
    update(currentCandle)
    {
        this.priceHistory.push(currentCandle);

        if (this.priceHistory.length > this.amount)
        {
            this.priceHistory.splice(0, 1);
        }

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
        return (this.priceHistory.length == this.amount) ? this.priceHistory : [];
    }
}

module.exports = PreviousNCandles;