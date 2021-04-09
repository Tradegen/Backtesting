const Comparator = require("../comparator");

class Closes extends Comparator {
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
        if (this.indicator2.getName() == "Up")
        {
            let currentCandle = this.indicator1.getValue();
            return (currentCandle.c > currentCandle.o);
        }
        else if (this.indicator2.getName() == "Down")
        {
            let currentCandle = this.indicator1.getValue();
            return (currentCandle.c < currentCandle.o);
        }

        return false;
    }
}

module.exports = Closes;