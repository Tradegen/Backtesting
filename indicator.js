class Indicator { 
    constructor(params) {
        this.params = params;
    }

    getName() {
        return this.name;
    }

    update(currentCandle) {
        return;
    }

    initialize(initialHistory) {
        return;
    }

    reset()
    {
        return;
    }

    getValue() {
        return;
    }

    getHistory() {
        return;
    }
}

module.exports = Indicator;