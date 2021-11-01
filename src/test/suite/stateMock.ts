import { stringify } from "querystring";

export default class StateMock {
    data: Map<String, String>;
    keys: () => readonly string[];

    constructor() {
        this.data = new Map<String, String>();
        this.keys = () => [...this.data.keys()].map(k => '' + k);
    }
    get(key: string, defaultValue = undefined) {
        return this.data.get(key) || defaultValue;
    }
    async update(key: string, value: string) {
        this.data.set(key, value);
    }
}