let cp = require('child_process');
let vscode = require('vscode');
let dirList = [];
let walker = require('walker');
let path = require('path');
let fs = require('fs');
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

exports.locateGitProjects = (projectsDirList, callBack) => {
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
            callBack(dirList); 
        } ) 
        .catch( error => { vscode.window.showErrorMessage('Error while loading Git Projects.');});

};

exports.clearDirList = () => {
    dirList = [];
};

function addToList(dirPath, repoName) {
    var obj = {
        dir: dirPath,
        name: path.basename(dirPath),
        repo: repoName
    };
    dirList.push(obj);
    return;
}

function extractRepoInfo(basePath) {
    var stdout = cp.execSync('git remote show origin -n', { cwd: basePath, encoding: 'utf8' });
    if (stdout.indexOf('Fetch URL:') === -1) {
        return '';
    } else {
        var arr = stdout.split('\n');
        for (var i = 0; i < arr.length; i++) {
            var line = arr[i];
            var repoPath = 'Fetch URL: ';
            var idx = line.indexOf(repoPath);
            if (idx === -1) continue;

            return line.trim().replace(repoPath, '');
        }                
    }
}

function processDirectory(absPath, fsOptions) {    
    vscode.window.setStatusBarMessage(absPath, 600);
    if (fs.existsSync(path.join(absPath, '.git', 'config'))) {
        addToList(absPath, checkForGitRepo ? extractRepoInfo(absPath) : 'not available');
    }
}

function handleError(err) {
    console.log('Error walker:', err);
}