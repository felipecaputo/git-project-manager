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

exports.showProjectList = () => {
        var self = this;
        
		function onResolve(selected) {
            if (!!selected) {
			 self.openProject(selected)
            }
		}
		
		function onReject(reason) {
			vscode.window.showInformationMessage(reason);
		}
		
        var isFolderConfigured = vscode.workspace.getConfiguration().has('gitProjectManager.baseProjectsFolder');

        if (!isFolderConfigured) {
            vscode.window.showWarningMessage('The configuration of "gitProjectManager.baseProjectsFolder" must be done before search for projects.');
            return;
        }
                        
        var dir = vscode.workspace.getConfiguration().get('gitProjectManager.baseProjectsFolder');
                 
        if (!fs.existsSync(dir)) {            
            vscode.window.showErrorMessage('The specified folder "' + dir + '" is not a valid folder.')
            return;
        }
        var options = {placeHolder: 'Select a folder to open: *(it may take a few seconds to search the folders)*'}
		vscode.window.showQuickPick(this.getProjectsList(dir), options).then( onResolve, onReject);    
}


exports.getProjectsList = (basePath) => {
    function getProjectListPromised(resolve, reject) {
        try {
            var projectLocator = require('./gitProjectLocator');
            
            // if (!vscode.workspace.getConfiguration('gitProjectManager').has('projectsFolder')) {
            //     vscode.window.showWarningMessage('Project folder not configured. Please configure "gitProjectManager.projectsFolder"');
            //     return;
            // }

            // var basePath = vscode.workspace.getConfiguration('gitProjectManager').get('projectsFolder');
            if (listAlreadyDone) {
                resolve(getQuickPickList());
            } else {
                projectLocator.locateGitProjects(basePath, (dirList) => {
                    repoList = dirList;
                    listAlreadyDone = true;
                    resolve(getQuickPickList());
                })
            }            
        } catch (error) {
            reject(error);
        }

    }
    
    var promise = new Promise(getProjectListPromised);
    return promise;
}

exports.openProject = (pickedObj) => {
    var cp = require('child_process');
    
    var p = require('path');

    var cmdLine = 'code "' + pickedObj.label + '"';
    
    //var cmdLine = '"' + process.execPath + '" "' + pickedObj.label + '"';
    
    console.log('---> ', require('path').normalize(process.execPath));
    cp.exec(cmdLine, (error, stdout, stderr) => {
        if (error) {
            console.log(error, stdout, stderr);
        }
        cp.exec('cd ..', (a, b, c) => {
            console.log('->', a, b, c);
        })
    })
}

exports.refreshList = () => {
    listAlreadyDone = false;
    this.getProjectsList('D:\\private\\node').then( ()=>{
        vscode.window.showInformationMessage('GPM ProjectList refreshed')
    }, ()=> {
        vscode.window.showErrorMessage('Error while updating GPM Project List');
    });
}