const Comparator = require("../comparator");

class ClosesBelow extends Comparator {
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

        if (indicator2Value == -1)
        {
            return false;
        }

        if (currentCandle.c < indicator2Value && this.indicator2.getName() == "LowOfFirstNMinutes")
        {
            this.indicator2.alreadyMetConditions = true;
        }

        return (currentCandle.c < indicator2Value);
    }
}

module.exports = ClosesBelow;