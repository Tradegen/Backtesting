const Comparator = require("../comparator");

class UpByAtMost extends Comparator {
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
        let gap = this.indicator1.getValue();
        let percent = this.indicator2.getValue();

        return (gap <= percent && gap > 0);
    }
}

module.exports = UpByAtMost;