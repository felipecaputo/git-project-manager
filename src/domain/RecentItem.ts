export default class RecentItem {
    projectPath: string;
    repository: string;
    lastUsed: number;

    constructor(path: string, repo: string, lastUsed: number) {
        this.projectPath = path;
        this.repository = repo;
        this.lastUsed = lastUsed;
    }
}