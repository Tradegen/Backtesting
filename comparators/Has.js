const Comparator = require("../comparator");

class Has extends Comparator {
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

        if (this.indicator2.getName() == "HigherVolume")
        {
            return (currentCandle.v > indicator2Value);
        }

        if (this.indicator2.getName() == "LowerVolume")
        {
            return (currentCandle.v < indicator2Value);
        }

        if (this.indicator2.getName() == "HigherRange")
        {
            let range = currentCandle.h - currentCandle.l;
            return (range > indicator2Value);
        }

        if (this.indicator2.getName() == "LowerRange")
        {
            let range = currentCandle.h - currentCandle.l;
            return (range < indicator2Value);
        }

        if (this.indicator2.getName() == "AtLeastNTimesRange")
        {
            let range = currentCandle.h - currentCandle.l;
            return (range > indicator2Value);
        }

        if (this.indicator2.getName() == "AtMostNTimesRange")
        {
            let range = currentCandle.h - currentCandle.l;
            return (range <= indicator2Value);
        }

        if (this.indicator2.getName() == "AtMostNTimesVolume")
        {
            return currentCandle.v <= indicator2Value;
        }

        if (this.indicator2.getName() == "AtLeastNTimesVolume")
        {
            return currentCandle.v > indicator2Value;
        }

        if (this.indicator2.getName() == "LongTopTail")
        {
            return indicator2Value;
        }

        if (this.indicator2.getName() == "LongBottomTail")
        {
            return indicator2Value;
        }

        return false;
    }
}

module.exports = Has;