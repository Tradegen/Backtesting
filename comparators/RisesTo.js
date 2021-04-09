const Comparator = require("../comparator");

class RisesTo extends Comparator {
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

        return (currentCandle.o < indicator2Value * 0.9996 && currentCandle.c > indicator2Value * 0.9998 && currentCandle.c < indicator2Value * 1.0002 && currentCandle.c > currentCandle.o);
    }
}

module.exports = RisesTo