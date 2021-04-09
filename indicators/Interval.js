const Indicator = require("../indicator");

class Interval extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.value = params[0];
    }

    getName()
    {
        return "Interval";
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
        return this.value;
    }
}

module.exports = Interval;