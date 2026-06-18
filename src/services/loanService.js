class LoanService {
    constructor() {
        this.observers = [];
    }

    subscribe(observer) {
        this.observers.push(observer);
    }

    async notify(event, data) {
        for (const observer of this.observers) {
            await observer.update(event, data);
        }
    }
}

module.exports = LoanService;