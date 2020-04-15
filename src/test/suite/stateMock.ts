import { stringify } from "querystring";

export default class StateMock {
    data: Map<String, String>;
    constructor() {
        this.data = new Map<String, String>();
    }
    get(key: string, defaultValue = undefined) {
        return this.data.get(key) || defaultValue;
    }
    async update(key: string, value: string) {
        this.data.set(key, value);
    }
}