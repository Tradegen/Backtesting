const Indicator = require("../indicator");

class Up extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
    }

    getName()
    {
        return "Up";
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
        return "Up";
    }
}

module.exports = Up;