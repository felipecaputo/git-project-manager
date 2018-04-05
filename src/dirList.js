const path = require('path')
module.exports = class DirList {
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
    get directories() {
        return this.dirs.map(x => x.dir);
    }
    concat(aDirList) {
        aDirList.dirList.forEach(e => this.add(e.dir, e.repo));
    }
    add(dirPath, repositoryName) {
        const dirName = path.basename(dirPath);

        if (this.exists(dirPath)) return;

        this.dirs.push({
            dir: dirPath,
            name: dirName,
            repo: repositoryName || 'not available'
        })
    }
    exists(dirPath) {
        return this.dirs.find(e => e.dir == dirPath) !== undefined;
    }
    clear() {
        this.dirs = [];
    }
}

