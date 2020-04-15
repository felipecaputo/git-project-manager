import { Memento } from "vscode";
import RecentItem from './domain/RecentItem';

export default class RecentItems {
    state: Memento;
    listSize: number;
    list: Array<RecentItem>;
    /**
     * Creates an instance of RecentItems.
     *
     * @param {Memento} state Global extension state.
     * @param {number} [listSize=5] Recent items list size.
     */
    constructor(state: Memento, listSize: number = 5) {
        this.state = state;
        this.listSize = listSize;
        this.list = this.state.get('recent', []);
    }
    addProject(projectPath: string, gitRepo: string) {
        const idx = this.list.findIndex(p => p.projectPath === projectPath);
        if (idx >= 0) {
            this.list[idx].lastUsed = new Date().getTime();
        } else {
            this.list.push(new RecentItem(projectPath, gitRepo, new Date().getTime()));
        };

        this.sortList();
        this.state.update('recent', this.list);
    }
    sortList() {
        this.list = this.list.sort((a, b) => b.lastUsed - a.lastUsed);
        if (this.list.length > this.listSize) {
            this.list = this.list.slice(0, this.listSize - 1);
        }
    }

}