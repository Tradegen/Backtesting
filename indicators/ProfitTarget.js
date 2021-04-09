const Indicator = require("../indicator");

class ProfitTarget extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.priceHistory = [];
      this.profitTarget = -1;
      this.multiplier = params[0];
    }

    getName()
    {
        return "ProfitTarget";
    }
  
    update(currentCandle)
    {
        if (typeof currentCandle.entryBar !== "undefined")
        {
            let profitTarget = (this.multiplier / 100) * currentCandle.entryBar.c;
            this.profitTarget = currentCandle.entryBar.c + profitTarget;
        }

        return;
    }

    initialize(initialHistory)
    {
        return;
    }

    reset()
    {
        this.profitTarget = -1;
        return;
    }

    getValue()
    {
        return this.profitTarget;
    }
}

module.exports = ProfitTarget;