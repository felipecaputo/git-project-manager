var repoList = [];
var vscode = require('vscode');

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


exports.getProjectsList = (basePath) => {
    function getProjectListPromised(resolve, reject) {
        var projectLocator = require('./gitProjectLocator');
        projectLocator.locateGitProjects(basePath, (dirList) => {
            repoList = dirList;
            resolve(getQuickPickList());
        })
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