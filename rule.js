class Rule { 
    constructor(indicator1, indicator2, comparator) {
        this.indicator1 = indicator1;
        this.indicator2 = indicator2;
        this.comparator = comparator;
    }

    update(currentCandle) {
        this.indicator1.update(currentCandle);
        this.indicator2.update(currentCandle);
        return;
    }

    initialize(initialHistory) {
        this.indicator1.initialize(initialHistory);
        this.indicator2.initialize(initialHistory);
        this.comparator.initialize();
        return;
    }

    reset()
    {
        this.indicator1.reset();
        this.indicator2.reset();
        this.comparator.reset();
        return;
    }

    checkConditions() {
        return this.comparator.checkConditions();
    }
}

module.exports = Rule;