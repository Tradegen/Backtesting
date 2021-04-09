const Indicator = require("../indicator");

class HighOfEntryBar extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.priceHistory = [];
      this.entryBarHighPrice = -1;
    }

    getName()
    {
        return "HighOfEntryBar";
    }
  
    update(currentCandle)
    {
        if (typeof currentCandle.entryBar !== "undefined")
        {
            this.entryBarHighPrice = currentCandle.entryBar.h;
        }

        return;
    }

    initialize(initialHistory)
    {
        return;
    }

    reset()
    {
        this.entryBarHighPrice = -1;
        return;
    }

    getValue()
    {
        return this.entryBarHighPrice;
    }
}

module.exports = HighOfEntryBar;