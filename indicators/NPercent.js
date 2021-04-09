const Indicator = require("../indicator");

class NPercent extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.percent = params[0];
    }

    getName()
    {
        return "NPercent";
    }
  
    update(currentCandle)
    {
        return;
    }

    initialize(initialHistory)
    {
        return;
    }

    reset()
    {
        return;
    }

    getValue()
    {
        return this.percent;
    }
}

module.exports = NPercent;