const Indicator = require("../indicator");

class Down extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
    }

    getName()
    {
        return "Down";
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
        return "Down";
    }
}

module.exports = Down;