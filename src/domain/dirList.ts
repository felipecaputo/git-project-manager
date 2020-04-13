import * as path from 'path';
import ProjectRepository from './ProjectRepository';

export default class DirList {
    dirs: ProjectRepository[];
    constructor() {
        this.dirs = [];
    }
    get dirList() {
        return this.dirs;
    }
    /**
     * Returns an array with all current directories
     *
     * @returns {[]string} An array that contains all directories
     * @readonly
     */
    get directories() : string[] {
        return this.dirs.map(x => x.directory);
    }
    concat(aDirList: DirList) {
        aDirList.dirList.forEach(e => this.add(e.directory, e.repository));
    }
    add(dirPath: string, repositoryName?: string) {
        const dirName = path.basename(dirPath);

        if (this.exists(dirPath)) {
            return;
        }

        this.dirs.push({
            directory: dirPath,
            name: dirName,
            repository: repositoryName || 'not available'
        });
    }
    exists(dirPath: string) {
        return this.dirs.find(e => e.directory === dirPath) !== undefined;
    }
    clear() {
        this.dirs = [];
    }
}

