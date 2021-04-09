const Indicator = require("../indicator");

class LowOfEntryBar extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.priceHistory = [];
      this.entryBarLowPrice = -1;
    }

    getName()
    {
        return "LowOfEntryBar";
    }
  
    update(currentCandle)
    {
        if (typeof currentCandle.entryBar !== "undefined")
        {
            this.entryBarLowPrice = currentCandle.entryBar.l;
        }

        return;
    }

    initialize(initialHistory)
    {
        return;
    }

    reset()
    {
        this.entryBarLowPrice = -1;
        return;
    }

    getValue()
    {
        return this.entryBarLowPrice;
    }
}

module.exports = LowOfEntryBar;