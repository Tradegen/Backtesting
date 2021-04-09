const Comparator = require("../comparator");

class RiseByAtLeast extends Comparator {
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

        let rise = 100 * (priceHistory[priceHistory.length - 1].c - priceHistory[0].o) / priceHistory[0].o;

        if (rise < 0)
        {
            return false;
        }

        return (rise >= percent);
    }
}

module.exports = RiseByAtLeast;