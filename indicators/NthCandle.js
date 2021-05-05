const Indicator = require("../indicator");

class NthCandle extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.priceHistory = [];
      this.number = params[0];
    }

    getName()
    {
        return "NthCandle";
    }
  
    update(currentCandle)
    {
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
        if (this.priceHistory.length < this.number)
        {
            return -1;
        }

        return this.priceHistory[this.priceHistory.length - this.number];
    }
}

module.exports = NthCandle;