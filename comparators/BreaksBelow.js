const Comparator = require("../comparator");

class BreaksBelow extends Comparator {
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

        if (this.indicator2.getName() == "Interval")
        {
            let newValue = Math.floor(currentCandle.o / indicator2Value);
            newValue *= indicator2Value;
            indicator2Value = newValue;
        }

        return (currentCandle.c < indicator2Value && currentCandle.o > indicator2Value);
    }
}

module.exports = BreaksBelow;