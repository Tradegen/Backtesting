const Indicator = require("../indicator");

class StopLoss extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.priceHistory = [];
      this.StopLoss = -1;
      this.multiplier = params[0];
    }

    getName()
    {
        return "StopLoss";
    }
  
    update(currentCandle)
    {
        if (typeof currentCandle.entryBar !== "undefined")
        {
            let stopLoss = (this.multiplier / 100) * currentCandle.entryBar.c;
            this.stopLoss = currentCandle.entryBar.c - stopLoss;
        }

        return;
    }

    initialize(initialHistory)
    {
        return;
    }

    reset()
    {
        this.stopLoss = -1;
        return;
    }

    getValue()
    {
        return this.stopLoss;
    }
}

module.exports = StopLoss;