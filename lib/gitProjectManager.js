var repoList = [];
var vscode = require('vscode');
var listAlreadyDone = false;

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
		
        var dir = 'D:\\private\\node'; //'/home/felipe/src';

		vscode.window.showQuickPick(this.getProjectsList(dir)).then( onResolve, onReject);    
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