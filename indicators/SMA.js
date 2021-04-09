const Indicator = require("../indicator");

class SMA extends Indicator {
    constructor(params) {
        super(params); // call the super class constructor and pass in the name parameter
        this.period = params[0];
        this.indicatorHistory = [];
        this.priceHistory = [];
        this.currentValue = 0.0;
        this.total = 0.0;
    }

    getName()
    {
        return "SMA";
    }
    
    update(currentCandle)
    {
        if (this.priceHistory.length == this.period)
        {
            let value = this.total;
            value = value - this.priceHistory[0];
            value = value + currentCandle.c;
            this.total = value;
            value = value / this.period;

            this.currentValue = value;
            this.indicatorHistory.push(value);

            this.priceHistory.splice(0, 1);
        }
        else
        {
            this.total += currentCandle.c;
        }

        this.priceHistory.push(currentCandle.c);

    }

    initialize(initialHistory)
    {
        let SMAperiod = 0;
        let sumOfPrices = 0.0;

        for (var i = this.period; i >= 1; i-=1)
        {
            sumOfPrices += initialHistory[initialHistory.length - i].c;
            this.priceHistory.push(initialHistory[initialHistory.length - i].c);
        }

        let value = sumOfPrices / this.period;
        this.currentValue = value;
        this.indicatorHistory.push(value);

        return;
    }

    reset()
    {
        this.priceHistory = [];
        this.indicatorHistory = [];
        this.currentValue = 0.0;
        this.total = 0.0;
        return;
    }

    getValue()
    {
        return this.currentValue;
    }
}

module.exports = SMA;