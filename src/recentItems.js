const path = require('path');
const fs = require('fs');


const RECENT_FILE_NAME = 'gpm-recentItems.json';

class RecentItems {
    /**
     * Creates an instance of RecentItems.
     * 
     * @param {string} pathToSave Path where the RecentItems file will be saved
     */
    constructor(pathToSave) {
            this.pathToSave = pathToSave;
            this.listSize = 5;
            this.list = [];
            this.loadFromFile();
        }
        /**
         * Returns the full path to recent projects file
         * 
         * @returns {string}
         */
    getPathToFile() {
        return path.join(this.pathToSave, RECENT_FILE_NAME);
    }
    loadFromFile() {
        const filePath = this.getPathToFile();
        if (fs.existsSync(filePath)) {
            this.list = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    }
    saveToFile() {
        fs.writeFileSync(this.getPathToFile(), JSON.stringify(this.list), {
            encoding: 'utf8'
        });
    }
    addProject(projectPath, gitRepo) {
        const idx = this.list.findIndex(p => p.projectPath === projectPath);
        if (idx >= 0) {
            this.list[idx].lastUsed = new Date().getTime();
        } else {
            this.list.push({
                projectPath,
                gitRepo,
                lastUsed: new Date().getTime()
            })
        };

        this.sortList();
        this.saveToFile();
    }
    sortList() {
        this.list = this.list.sort((a, b) => b.lastUsed - a.lastUsed);
        if (this.list.length > this.listSize)
            this.list = this.list.slice(0, this.listSize - 1);
    }

}

module.exports = RecentItems;