module.exports = class {
    constructor() {
        this.data = {};
    }
    get(key, defaultValue = undefined) {
        return this.data.hasOwnProperty(key) ? this.data[key] : defaultValue;
    }
    async update(key, value) {
        this.data[key] = value;
    }
}