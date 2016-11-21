const cp = require('child_process');
const vscode = require('vscode');
const walker = require('walker');
const path = require('path');
const fs = require('fs');
const DirList = require('./dirList');

let dirList = new DirList();
let maxDepth = -1;
let ignoredFolders = [];
let checkForGitRepo = false;
let warnFoldersNotFound = false;

/**
 * Returns the depth of the directory path
 *
 * @param {string} s The path to be processed
 * @returns Number
 */
function getPathDepth(s) {
    return s.split(path.sep).length;
}

function isMaxDeptReached(currentDepth, initialDepth) {
    return (maxDepth > 0) && ((currentDepth - initialDepth) > maxDepth);
}

function isFolderIgnored(folder) {
     return ignoredFolders.indexOf(folder) !== -1;
}

function initializeCfg() {
     ignoredFolders = vscode.workspace.getConfiguration('gitProjectManager').get('ignoredFolders', []);
     maxDepth = vscode.workspace.getConfiguration('gitProjectManager').get('maxDepthRecursion', -1);
     checkForGitRepo = vscode.workspace.getConfiguration('gitProjectManager').get('checkRemoteOrigin', true);
     warnFoldersNotFound = vscode.workspace.getConfiguration('gitProjectManager').get('warnIfFolderNotFound', false);
 }

exports.locateGitProjects = (projectsDirList) => {
    return new Promise( (resolve, reject) => {
        var promises = [];
        initializeCfg();

        projectsDirList.forEach((projectBasePath) => {
            if (!fs.existsSync(projectBasePath)) {
                if (warnFoldersNotFound)
                    vscode.window.showWarningMessage('Directory ' + projectBasePath + ' does not exists.');

                return;
            }

            var depth = getPathDepth(projectBasePath);

            var promise = new Promise((resolve, reject) => {
                try {
                    walker(projectBasePath)
                        .filterDir(  (dir, stat) => {
                            return !(isFolderIgnored(path.basename(dir)) ||
                                isMaxDeptReached(getPathDepth(dir), depth));
                        } )
                        .on('dir', processDirectory)
                        .on('symlink', processDirectory)
                        .on('error', handleError)
                        .on('end', () => {
                            resolve();
                        });
                } catch (error) {
                    reject(error);
                }

            });
            promises.push(promise);
        });        

        Promise.all(promises)
            .then(() => {
                vscode.window.setStatusBarMessage('GPM: Searching folders completed', 1500);
                resolve(dirList);
            } )
            .catch(reject);
    } )
};

exports.clearDirList = () => {
    dirList = new DirList();
};

function extractRepoInfo(basePath) {
    if (!checkForGitRepo) 
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

function processDirectory(absPath, fsOptions) {
    vscode.window.setStatusBarMessage(absPath, 600);
    if (fs.existsSync(path.join(absPath, '.git', 'config'))) {
        dirList.add(absPath, extractRepoInfo(absPath));
    }
}

function handleError(err) {
    console.log('Error walker:', err);
}