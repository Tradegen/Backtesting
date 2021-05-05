const Comparator = require("../comparator");

class CrossesAbove extends Comparator {
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
        let indicator1History = this.indicator1.getHistory();
        let indicator2History = this.indicator2.getHistory();

        if (indicator1History.length < 2)
        {
            return false;
        }

        if (indicator2History.length < 2)
        {
            return false;
        }

        return (indicator1History[indicator1History.length - 2] < indicator2History[indicator2History.length - 2]
            && indicator1History[indicator1History.length - 1] > indicator2History[indicator2History.length - 1]);
    }
}

module.exports = CrossesAbove;