const Indicator = require("../indicator");

class CurrentCandle extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.currentCandle = undefined;
    }

    getName()
    {
        return "CurrentCandle";
    }
  
    update(currentCandle)
    {
        this.currentCandle = currentCandle;
    }

    initialize(initialHistory)
    {
        return;
    }

    reset()
    {
        this.currentCandle = undefined;
        return;
    }

    getValue()
    {
        return this.currentCandle;
    }
}

module.exports = CurrentCandle;