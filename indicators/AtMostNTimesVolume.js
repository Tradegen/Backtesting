const Indicator = require("../indicator");

class AtMostNTimesVolume extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.priceHistory = [];
      this.multiplier = params[0];
    }

    getName()
    {
        return "AtMostNTimesVolume";
    }
  
    update(currentCandle)
    {
        this.priceHistory.push(currentCandle);
        return;
    }

    initialize(initialHistory)
    {
        return;
    }

    reset()
    {
        this.priceHistory = [];
        return;
    }

    getValue()
    {
        if (this.priceHistory.length < 2)
        {
            return -1;
        }

        let previousVolume = this.priceHistory[this.priceHistory.length - 2].v;
        previousVolume *= this.multiplier;

        return previousVolume;
    }
}

module.exports = AtMostNTimesVolume;