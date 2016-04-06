
var vscode = require('vscode');
var dirList = [];
var walker = require('walker');
var path = require('path');
var fs = require('fs');
var maxDepth = -1;
var ignoredFolders = [];
    
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
     return ignoredFolders.indexOf(folder) != -1;
 }
 
 function initializeCfg() {
     if (vscode.workspace.getConfiguration('gitProjectManager').has('ignoredFolders')) {
         ignoredFolders = vscode.workspace.getConfiguration('gitProjectManager').get('ignoredFolders') || [];
     }
     
     if (vscode.workspace.getConfiguration('gitProjectManager').has('maxDepthRecursion')) {
         maxDepth = vscode.workspace.getConfiguration('gitProjectManager').get('maxDepthRecursion') || -1;
     }
 }

exports.locateGitProjects = (projectsDirList, callBack) => {
    var promises = [];
    initializeCfg();

    var fs = require('fs');
    projectsDirList.forEach((projectBasePath) => {
        if (!fs.existsSync(projectBasePath)) {
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
   
    Promise.all(promises).then(
        () => { callBack(dirList); }, 
        (error) => { vscode.window.showErrorMessage('Error while loading Git Projects.');});

};

function addToList(dirPath, repoName) {
    var obj = {
        dir: dirPath,
        repo: repoName
    };
    dirList.push(obj);
    return;
}

function extractRepoInfo(basePath) {
    var cp = require('child_process');
    var stdout = cp.execSync('git remote show origin -n', { cwd: basePath, encoding: 'utf8' });
    if (stdout.indexOf('Fetch URL:') == -1) {
        return '';
    } else {
        var arr = stdout.split('\n');
        for (var i = 0; i < arr.length; i++) {
            var line = arr[i];
            var repoPath = 'Fetch URL: ';
            var idx = line.indexOf(repoPath);
            if (idx == -1) continue;

            return line.trim().replace(repoPath, '');
        }                
    }
}

function processDirectory(absPath, fsOptions) {    
    vscode.window.setStatusBarMessage(absPath);
    if (fs.existsSync(path.join(absPath, '.git', 'config'))) {

        addToList(absPath, extractRepoInfo(absPath));
    }
}

function handleError(err) {
    console.log('Error walker:', err);
}