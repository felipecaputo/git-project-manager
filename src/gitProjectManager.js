const fs = require('fs');
const vscode = require('vscode');
const path = require('path');
const cp = require('child_process');
const os = require('os');
const DirList = require('./dirList');

let projectLocator = require('./gitProjectLocator');
let loadedRepoListFromFile = false;
let baseDir = '';
let repoList = [];
let listAlreadyDone = false;

if (process.platform == "linux") {
    baseDir = path.join(os.homedir(), '.config');
} else {
    baseDir = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : '/var/local');
}

const gpmRepoListFile = path.join(baseDir, "Code/User/gpm_projects.json");

function getQuickPickList() {
    let qp = [];
    let checkRemoteCfg = vscode.workspace.getConfiguration('gitProjectManager').get('checkRemoteOrigin', false);
    repoList = repoList.sort((a, b) => {
        return a.name > b.name ? 1 : -1
    });
    for (let i = 0; i < repoList.length; i++) {
        let qpItem = {
            label: repoList[i].name,
            description: checkRemoteCfg ? repoList[i].repo : repoList[i].dir
        };
        qp.push(qpItem);
    }
    return qp;
}

function handleError(error) {
    vscode.window.showErrorMessage(`Error in GPM Manager ${error}`);
}

function storeDataBetweenSessions() {
    return vscode.workspace.getConfiguration('gitProjectManager')
        .get('storeRepositoriesBetweenSessions', false);
}

function saveRepositoryInfo() {
    if (storeDataBetweenSessions()) {
        fs.writeFileSync(gpmRepoListFile, JSON.stringify(repoList), {
            encoding: 'utf8'
        });
    }
}

function loadRepositoryInfo() {
    if (loadedRepoListFromFile) {
        return false;
    }

    if ((storeDataBetweenSessions()) && (fs.existsSync(gpmRepoListFile))) {
        repoList = JSON.parse(fs.readFileSync(gpmRepoListFile, 'utf8'));
        loadedRepoListFromFile = true;
        listAlreadyDone = true;
        return true;
    } else {
        return false;
    }
}

function addRepoInRepoList(repoInfo) {
    let map = repoList.map((info) => {
        return info.dir;
    });
    if (map.indexOf(repoInfo.dir) === -1) {
        repoList.push(repoInfo);
    }
}

function getProjectsFolders() {
    return new Promise((resolve, reject) => {
        try {
            var isFolderConfigured = vscode.workspace.getConfiguration('gitProjectManager').has('baseProjectsFolders');

            if (!isFolderConfigured) {
                reject('You need to configure at least on folder in "gitProjectManager.baseProjectsFolders" before search for projects.');
                return;
            }

            var baseProjectsFolders = vscode.workspace.getConfiguration('gitProjectManager').get('baseProjectsFolders');
            var resolvedProjectsFolders = baseProjectsFolders.map(path => {
                return resolveEnvironmentVariables(process.platform, path);
            })
            resolve(resolvedProjectsFolders);
        } catch (error) {
            reject(error);
        }
    });
}

function resolveEnvironmentVariables(processPlatform, aPath) {
    var envVarMatcher = processPlatform === 'win32' ? /%([^%]+)%/g : /\$([^\/]+)/g;
    let resolvedPath = aPath.replace(envVarMatcher, function (_, key) {
        return process.env[key];
    });

    return resolvedPath.charAt(0) == '~' ? path.join(process.env.HOME, resolvedPath.substr(1)) : resolvedPath;
};

exports.showProjectList = () => {
    var self = this;

    function onResolve(selected) {
        if (selected) {
            self.openProject(selected);
        }
    }

    function onReject(reason) {
        vscode.window.showInformationMessage(`Error while showing Project list: ${reason}`);
    }

    var options = {
        placeHolder: 'Select a folder to open:      (it may take a few seconds to search the folders the first time)'
    };

    var projectsPromise = getProjectsFolders().then((folders) => {
        return this.getProjectsList(folders);
    }).catch(handleError);
    vscode.window.showQuickPick(projectsPromise, options).then(onResolve, onReject);
};


/**
 * 
 * 
 * @param {DirList} dirList
 */
function addUnversionedProjects(dirList) {
    let unversioned = vscode.workspace.getConfiguration('gitProjectManager').get('unversionedProjects', []);
    unversioned.forEach(proj => dirList.add(proj));
    return dirList.dirs;
}

function updateRepoList(dirList) {
    dirList.forEach(addRepoInRepoList);
    listAlreadyDone = true;
    saveRepositoryInfo();
    return dirList;
}

exports.getProjectsList = (directories) => {
    return new Promise((resolve, reject) => {
        try {
            if (listAlreadyDone) {
                resolve(getQuickPickList());
                return;
            }

            if (loadRepositoryInfo()) {
                resolve(getQuickPickList());
                return;
            }

            projectLocator.locateGitProjects(directories)
                .then(addUnversionedProjects)
                .then(updateRepoList)
                .then(() => resolve(getQuickPickList()));
        } catch (error) {
            reject(error);
        }
    });
};

function openProjectViaShell(projPath) {

    let codePath = getCodePath();
    if (codePath.indexOf(' ') !== -1)
        codePath = `"${codePath}"`;

    let cmdLine = `${codePath} ${projPath}`;

    cp.exec(cmdLine, (error, stdout, stderr) => {
        if (error) {
            console.log(error, stdout, stderr);
        }
        cp.exec('cd ..', (a, b, c) => {
            console.log('->', a, b, c);
        });
    });
}

exports.openProject = (pickedObj) => {
    let projectPath = getProjectPath(pickedObj),
        uri = vscode.Uri.file(projectPath),
        newWindow = vscode.workspace.getConfiguration(
            'gitProjectManager'
        ).get(
            'openInNewWindow', false
        );

    vscode.commands.executeCommand('vscode.openFolder', uri, newWindow)
        .then() //done
        .catch(() => openProjectViaShell(projectPath));

};

function getCodePath() {
    let cfg = vscode.workspace.getConfiguration(
        'gitProjectManager'
    ).get(
        'codePath', 'code'
    );

    let codePath = 'code'
    if (typeof cfg === 'string') {
        codePath = cfg;
    } else if (cfg.toString() === '[object Object]') {
        codePath = cfg[process.platform];
    } else if (cfg.length) {
        for (let i = 0; i < cfg.length; i++) {
            if (fs.existsSync(cfg[i])) {
                codePath = cfg[i];
                break;
            }
        }
    }

    return codePath;
}

function getProjectPath(pickedObj) {
    let checkRemoteCfg = vscode.workspace.getConfiguration('gitProjectManager').get('checkRemoteOrigin', false);
    if (!checkRemoteCfg)
        return pickedObj.description;

    let map = repoList.map(proj => {
        return checkRemoteCfg ? `${proj.name}.${proj.repo}` : `${proj.name}.${proj.dir}`
    });
    return repoList[map.indexOf(`${pickedObj.label}.${pickedObj.description}`)].dir;
}

function internalRefresh(folders, suppressMessage) {
    listAlreadyDone = false;
    exports.getProjectsList(folders)
        .then(() => {
            if (!suppressMessage) {
                vscode.window.setStatusBarMessage('Git Project Manager - Project List Refreshed');
            }
        })
        .catch((error) => {
            if (!suppressMessage) {
                handleError(error);
            }
        });
}

exports.refreshList = (suppressMessage) => {
    repoList = [];
    projectLocator.clearDirList();

    getProjectsFolders()
        .then((folders) => {
            internalRefresh(folders, suppressMessage);
        })
        .catch((error) => {
            if (!suppressMessage) {
                handleError(error);
            }
        });
};

exports.refreshSpecificFolder = () => {
    var options = {
        placeHolder: 'Select a folder to open:      (it may take a few seconds to search the folders the first time)'
    };
    getProjectsFolders()
        .then((list) => {
            vscode.window.showQuickPick(list, options)
                .then((selection) => {
                    if (!selection) return;
                    internalRefresh([selection]);
                })
                .catch((error) => {
                    console.log(error);
                });
        })
        .catch((error) => {
            console.log(error);
        });

};