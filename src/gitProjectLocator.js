// @ts-check
const cp = require('child_process');
const vscode = require('vscode');
const walker = require('walker');
const path = require('path');
const fs = require('fs');
const DirList = require('./dirList');
const Config = require('./config');

class ProjectLocator {
    constructor(config) {
        this.dirList = new DirList();
        this.config = new Config();
        if(config)
            this.config = config;
    }
    /**
     * Returns the depth of the directory path
     *
     * @param {String} s The path to be processed
     * @returns Number
     */
    getPathDepth(s) {
        return s.split(path.sep).length;
    }
    isMaxDeptReached(currentDepth, initialDepth) {
        return (this.config.maxDepthRecursion > 0) && ((currentDepth - initialDepth) > this.config.maxDepthRecursion);
    }
    isFolderIgnored(folder) {
        return this.config.ignoredFolders.indexOf(folder) !== -1;
    }
    /**
     * Returs true if the *directory* param refers to a folder that is nested to an already found project and
     * _gitProjectManager.searchInsideProjects_ is true
     * 
     * @param {string} directory 
     */
    isNestedIgnoredFolder(directory) {
        return !this.config.searchInsideProjects && this.dirList.directories.some(dir => directory.includes(dir))
    }
    checkFolderExists(folderPath) {
        const exists = fs.existsSync(folderPath);
        if (!exists && this.config.warnFoldersNotFound) {
            vscode.window.showWarningMessage('Directory ' + folderPath + ' does not exists.');
        }

        return exists;
    }
    filterDir(dir, depth) {
        if (this.isFolderIgnored(path.basename(dir))) return false;
        if (this.isMaxDeptReached(this.getPathDepth(dir), depth)) return false;
        if (this.isNestedIgnoredFolder(dir)) return false;

        return true
    }
    walkDirectory(dir) {
        var depth = this.getPathDepth(dir);

        // @ts-ignore
        return new Promise((resolve, reject) => {
            try {
                walker(dir)
                    .filterDir((dir) => this.filterDir(dir, depth))
                    .on('dir', absPath => this.processDirectory(absPath))
                    .on('symlink', absPath => this.processDirectory(absPath))
                    .on('error', e => this.handleError(e))
                    .on('end', () => {
                        resolve();
                    });
            } catch (error) {
                reject(error);
            }

        });
    }
    locateGitProjects(projectsDirList) {
        // @ts-ignore
        return new Promise((resolve, reject) => {
            /** @type {string[]} */
            var promises = [];

            projectsDirList.forEach((projectBasePath) => {
                if (!this.checkFolderExists(projectBasePath)) return;

                promises.push(this.walkDirectory(projectBasePath));
            });

            // @ts-ignore
            Promise.all(promises)
                .then(() => {
                    vscode.window.setStatusBarMessage('GPM: Searching folders completed', 1500);
                    resolve(this.dirList);
                })
                .catch(reject);
        })
    };
    clearDirList() {
        this.dirList = new DirList();
    };
    extractRepoInfo(basePath) {
        if (!this.config.checkRemoteOrigin)
            return;

        var stdout = cp.execSync('git remote show origin -n', { cwd: basePath, encoding: 'utf8' });
        if (stdout.indexOf('Fetch URL:') === -1)
            return;

        var arr = stdout.split('\n');
        for (var i = 0; i < arr.length; i++) {
            var line = arr[i];
            var repoPath = 'Fetch URL: ';
            var idx = line.indexOf(repoPath);
            if (idx > -1)
                return line.trim().replace(repoPath, '');
        }
    }
    processDirectory(absPath) {
        vscode.window.setStatusBarMessage(absPath, 600);
        if (fs.existsSync(path.join(absPath, '.git', 'config'))) {
            this.dirList.add(absPath, this.extractRepoInfo(absPath));
        }
    }
    handleError(err) {
        console.log('Error walker:', err);
    }
}

module.exports = ProjectLocator;