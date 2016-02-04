var repoList = [];
var vscode = require('vscode');
var listAlreadyDone = false;
var fs = require('fs');

function getQuickPickList() {
    var qp = [];
    for (var i = 0; i < repoList.length; i++) {
        var qpItem = {
            label: repoList[i].dir,
            description: repoList[i].repo
        };
        qp.push(qpItem);
    }
    return qp;
}

function handleError(error) {
    vscode.window.showErrorMessage(error);
}

function addRepoInRepoList(repoInfo) {
    var map = repoList.map( (info) => {
        return info.dir;
    } );
    if (map.indexOf(repoInfo.dir) == -1) {
        repoList.push(repoInfo);
    } 
}

function getProjectsFolders () {
    return new Promise( (resolve, reject) => {
        try {
            var isFolderConfigured = vscode.workspace.getConfiguration('gitProjectManager').has('baseProjectsFolders');

            if (!isFolderConfigured) {
                reject('You need to configure at least on folder in "gitProjectManager.baseProjectsFolders" before search for projects.');
                return;
            }
                            
            resolve(vscode.workspace.getConfiguration('gitProjectManager').get('baseProjectsFolders'));            
        } catch (error) {
            reject(error);
        }        
    });
}

exports.showProjectList = () => {
        var self = this;
        
		function onResolve(selected) {
            if (!!selected) {
			 self.openProject(selected);
            }
		}
		
		function onReject(reason) {
			vscode.window.showInformationMessage(reason);
		}
                 
        var options = {placeHolder: 'Select a folder to open:      (it may take a few seconds to search the folders the first time)'};
        getProjectsFolders()
            .then((folders) => {
                vscode.window.showQuickPick(
                    this.getProjectsList(folders), options).then( onResolve, onReject);
            })
            .catch(handleError);    
};


exports.getProjectsList = (directories) => {
    function getProjectListPromised(resolve, reject) {
        try {
            var projectLocator = require('./gitProjectLocator');
            
            if (listAlreadyDone) {
                resolve(getQuickPickList());
            } else {
                projectLocator.locateGitProjects(directories, (dirList) => {
                    dirList.forEach(addRepoInRepoList);
                    listAlreadyDone = true;
                    resolve(getQuickPickList());
                });
            }            
        } catch (error) {
            reject(error);
        }

    }
    
    var promise = new Promise(getProjectListPromised);
    return promise;
};

exports.openProject = (pickedObj) => {
    var cp = require('child_process');

    var cmdLine = 'code "' + pickedObj.label + '"';
        
    cp.exec(cmdLine, (error, stdout, stderr) => {
        if (error) {
            console.log(error, stdout, stderr);
        }
        cp.exec('cd ..', (a, b, c) => {
            console.log('->', a, b, c);
        });
    });
};

function internalRefresh (folders) {
    listAlreadyDone = false;
    exports.getProjectsList(folders)
        .then( ()=>{
            vscode.window.showInformationMessage('GPM ProjectList refreshed');
        })
        .catch(handleError);        
}

exports.refreshList = () => {    
    repoList = [];

    getProjectsFolders()
        .then( internalRefresh )
        .catch(handleError);        
};

exports.refreshSpecificFolder = () => {
    var options = {placeHolder: 'Select a folder to open:      (it may take a few seconds to search the folders the first time)'};
    getProjectsFolders()
        .then((list)=>{
            vscode.window.showQuickPick(list, options)
                .then( (selection) => {
                    if (!selection) return;
                    internalRefresh([selection]);
                });
        });
    
};