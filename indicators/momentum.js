const Indicator = require("../indicator");

class momentum extends Indicator {
    constructor(params) {
    super(params); // call the super class constructor and pass in the name parameter
    this.period = params[0];
    this.indicatorHistory = [];
    this.priceHistory = [];
    this.currentValue = 0.0;
    }

    update(bar)
    {
        this.priceHistory.push(bar);

        if (this.priceHistory.length > this.period)
        {
            this.priceHistory.splice(0, 1);
        }
        let momentum = this.priceHistory[this.priceHistory.length - 1].closePrice - this.priceHistory[0].c;
        this.value = momentum;
        this.indicatorHistory.push(momentum);
    }

    calculateInitialValues(bars)
    {
        this.priceHistory = bars.splice(bars.length - this.period, this.period);
        let value = bars[bars.length - 1].c - bars[bars.length - this.period].c;
        this.currentValue = value;
        this.indicatorHistory.push(value);
    }

    reset()
    {
        this.priceHistory = [];
        this.indicatorHistory = [];
        this.currentValue = 0.0;
        return;
    }

    getValue()
    {
        return this.currentValue;
    }
}

module.exports = momentum;