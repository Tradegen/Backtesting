const Comparator = require("../comparator");

class FallByAtLeast extends Comparator {
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
        let priceHistory = this.indicator1.getValue();
        let percent = this.indicator2.getValue();

        if (priceHistory.length == 0)
        {
            return false;
        }

        let fall = 100 * (priceHistory[0].o - priceHistory[priceHistory.length - 1].c) / priceHistory[priceHistory.length - 1].c;

        if (fall < 0)
        {
            return false;
        }

        return (fall >= percent);
    }
}

module.exports = FallByAtLeast;