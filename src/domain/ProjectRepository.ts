export default class ProjectRepository {
    name: string;
    directory: string;
    repository: string;
    constructor(name: string, dir: string, repo: string) {
        this.name = name;
        this.directory = dir;
        this.repository = repo;
    }
}