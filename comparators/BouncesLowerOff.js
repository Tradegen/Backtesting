const Comparator = require("../comparator");

class BouncesLowerOff extends Comparator {
    constructor(indicator1, indicator2) {
      super(indicator1, indicator2); // call the super class constructor and pass in the name parameter
      this.indicator1 = indicator1;
      this.indicator2 = indicator2;
    }
  
    initialize() {
        return;
    }

    reset()
    {
        return;
    }

    checkConditions() {
        let currentCandle = this.indicator1.getValue();
        let indicator2Value = this.indicator2.getValue();

        if (currentCandle == -1)
        {
            return false;
        }

        if (indicator2Value == -1)
        {
            return false;
        }

        return (currentCandle.c < indicator2Value && currentCandle.h >= indicator2Value && currentCandle.c < currentCandle.o);
    }
}

module.exports = BouncesLowerOff