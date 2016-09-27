const path = require('path')
module.exports = class DirList {
    constructor() {
        this.dirs = [];
    }
    get dirList() {
        return this.dirs;
    }
    concat(aDirList) {
        this.dirs = this.dirList.concat(aDirList.dirList);
    }
    add(dirPath, repositoryName) {
        const dirName = path.basename(dirPath); 
        this.dirs.push({
            dir: dirPath,
            name: dirName,
            repo: repositoryName || 'not available'
        })
    }
    exists(dirPath) {
        return this.dirs.some( info => info.dir == dirPath);
    }
}

