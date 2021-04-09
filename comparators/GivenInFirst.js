const Comparator = require("../comparator");

class GivenInFirst extends Comparator {
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
        let signal = this.indicator1.getValue();
        let index = this.indicator2.getValue();

        

        if (index == -1)
        {
            return false;
        }

        return (signal <= index);
    }
}

module.exports = GivenInFirst