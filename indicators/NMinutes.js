const Indicator = require("../indicator");

class NMinutes extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.timeframe = 1;
      this.minutes = params[0];
      this.index = -1;
    }

    getName()
    {
        return "NMinutes";
    }
  
    update(currentCandle)
    {
        if ((typeof currentCandle.timeframe !== "undefined") && (currentCandle.timeframe > 0))
        {
            this.timeframe = currentCandle.timeframe;
            this.index = Math.ceil(this.minutes/this.timeframe);
        };
        return;
    }

    initialize(initialHistory)
    {
        return;
    }

    reset()
    {
        this.index = -1;
        this.timeframe = 1;
        return;
    }

    getValue()
    {
        return this.index;
    }
}

module.exports = NMinutes;