
var vscode = require('vscode');
var dirList = [];
var walker = require('walker');
var path = require('path');
    
exports.locateGitProjects = (projectsDirList, callBack) => {
    var promises = [];

    var fs = require('fs');
    projectsDirList.forEach((projectBasePath) => {
        if (!fs.existsSync(projectBasePath)) {
            vscode.window.showWarningMessage('Directory ' + projectBasePath + ' does not exists.');
            return;
        }
        
        var depth = projectBasePath.split(path.sep).length;
        
        var promise = new Promise((resolve, reject) => {
            try {
                walker(projectBasePath)
                    .filterDir(shouldIgnoreFolder)
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

// function (path)

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
    var currentDir = path.basename(absPath);
    vscode.window.setStatusBarMessage(absPath);
    if (currentDir == '.git') {
        var fileName = path.join(absPath, 'config');
        var fs = require('fs');

        fs.exists(fileName, (exists) => {
            if (!exists) return;
            var originPath = path.normalize(absPath + path.sep + '..');
            addToList(originPath, extractRepoInfo(originPath));
        });

    }
}

function handleError(err) {
    console.log('Error walker:', err);
}