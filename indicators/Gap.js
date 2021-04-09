const Indicator = require("../indicator");

class Gap extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.gap = 0;
    }

    getName()
    {
        return "Gap";
    }
  
    update(currentCandle)
    {
        if (typeof currentCandle.gap !== "undefined")
        {
            this.gap = currentCandle.gap;
        }
        return;
    }

    initialize(initialHistory)
    {
        return;
    }

    reset()
    {
        this.gap = 0;
        return;
    }

    getValue()
    {
        return this.gap;
    }
}

module.exports = Gap;