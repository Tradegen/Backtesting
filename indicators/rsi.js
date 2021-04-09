const Indicator = require("../indicator");

class rsi extends Indicator {
    constructor(params) {
      super(params); // call the super class constructor and pass in the name parameter
      this.period = params[0];
      this.indicatorHistory = [];
      this.priceHistory = [];
      this.currentValue = 0.0;
      this.upCloses = [];
      this.downCloses = [];
    }
  
    update(bar)
    {
        this.priceHistory.push(bar);

        if (bar.c >= bar.o)
        {
            this.upCloses.push(bar)
        }
        else
        {
            this.downCloses.push(bar);
        }

        if (this.priceHistory.length > this.period)
        {
            if (this.priceHistory[0].c >= this.priceHistory[0].o)
            {
                this.upCloses.splice(0, 1);
            }
            else
            {
                this.downCloses.splice(0, 1);
            }

            this.priceHistory.splice(0, 1);
        }

        let averageUpCloses = 0;

        if (this.upCloses.length == 0)
        {
            averageUpCloses = 0;
        }
        else
        {
            const reducer = (accumulator, currentValue) => accumulator + currentValue;
            averageUpCloses = (this.upCloses.length > 0) ? this.upCloses.reduce(reducer, 0.0) / this.upCloses.length : 0;
        }

        let averageDownCloses = 0;

        if (this.downCloses.length == 0)
        {
            averageDownCloses = 0;
        }
        else
        {
            const reducer = (accumulator, currentValue) => accumulator + currentValue;
            averageDownCloses = (this.downCloses.length > 0) ? this.downCloses.reduce(reducer, 0.0) / this.downCloses.length : 0;
        }

        let RSI = 0.0;

        if (averageDownCloses == 0)
        {
            RSI = 100;
        }
        else
        {
            let RS = averageUpCloses / averageDownCloses;
            RSI = 100 - (100 / (1 + RS));
        }

        this.currentValue = RSI;
        this.indicatorHistory.push(RSI);
    }

    calculateInitialValues(bars)
    {
        for (var i = self.period; i >= 1; i-=1)
        {
            let current = bars[bars.length - i];
            this.priceHistory.push(current);

            //check for up bar
            if (current.c >= current.o)
            {
                this.upCloses.push(current);
            }
            else
            {
                this.downCloses.push(current);
            }
            
            const reducer = (accumulator, currentValue) => accumulator + currentValue;
            let averageUpCloses = (this.upCloses.length > 0) ? this.upCloses.reduce(reducer, 0) / this.upCloses.length : 0;
            let averageDownCloses = (this.downCloses.length > 0) ? this.downCloses.reduce(reducer, 0) / this.downCloses.length * -1 : 0;

            let RSI = 0.0;

            if (averageDownCloses == 0)
            {
                RSI = 100;
            }
            else
            {
                let RS = averageUpCloses / averageDownCloses;
                RSI = 100 - (100 / (1 + RS));
            }

            this.currentValue = RSI;
            this.indicatorHistory.push(RSI);
        }

        return;
    }

    reset()
    {
        this.priceHistory = [];
        this.indicatorHistory = [];
        this.currentValue = 0.0;
        this.upCloses = [];
        this.downCloses = [];
        return;
    }

    getValue()
    {
        return this.currentValue;
    }
}

module.exports = rsi;