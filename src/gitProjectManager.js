const EXTENSION_NAME = 'gitProjectManager';

const fs = require('fs');
const vscode = require('vscode');
const path = require('path');
const cp = require('child_process');
const os = require('os');
const SHA256 = require('crypto-js').SHA256;

const RecentItems = require('./recentItems');
let projectLocator = require('./gitProjectLocator');

class GitProjectManager {
    constructor() {
        this.loadedRepoListFromFile = false;
        this.repoList = [];
        this.storedLists = new Map();
        this.baseDir = this.getBaseDir();
        this.gpmRepoListFile = path.join(this.baseDir, "Code/User/gpm_projects.json");
        this.recentList = new RecentItems(path.join(this.baseDir, "Code/User/"));
        this.recentList.listSize = vscode.workspace.getConfiguration(EXTENSION_NAME).get('gitProjectManager.recentProjectsListSize', 5);

        this.updateRepoList = this.updateRepoList.bind(this);
        this.addRepoInRepoList = this.addRepoInRepoList.bind(this);

    }
    /**
     * Get the base user cfg directory 
     * 
     * @returns {string}
     */
    getBaseDir() {
        if (process.platform == "linux") {
            return path.join(os.homedir(), '.config');
        } else {
            return process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : '/var/local');
        }
    }
    getQuickPickList() {
        let checkRemoteCfg = vscode.workspace.getConfiguration(EXTENSION_NAME).get('checkRemoteOrigin', false);
        this.repoList = this.repoList.sort((a, b) => {
            return a.name > b.name ? 1 : -1
        });

        return this.repoList.map(repo => {
            return {
                label: repo.name,
                description: checkRemoteCfg ? repo.repo : repo.dir
            };
        });
    }
    handleError(error) {
        vscode.window.showErrorMessage(`Error in GPM Manager ${error}`);
    }
    get storeDataBetweenSessions() {
        return vscode.workspace.getConfiguration('gitProjectManager')
            .get('storeRepositoriesBetweenSessions', false);
    }
    saveRepositoryInfo(directories) {
        this.storedLists.set(this.getDirectoriesHash(directories), this.repoList);

        if (this.storeDataBetweenSessions) {
            fs.writeFileSync(this.gpmRepoListFile, JSON.stringify(this.storedLists), {
                encoding: 'utf8'
            });
        }
    }
    loadRepositoryInfo() {
        if (this.loadedRepoListFromFile) {
            return false;
        }

        if ((this.storeDataBetweenSessions) && (fs.existsSync(this.gpmRepoListFile))) {
            this.storedLists = JSON.parse(fs.readFileSync(this.gpmRepoListFile, 'utf8'));
            this.loadedRepoListFromFile = true;
            return true;
        } else {
            return false;
        }
    }

    addRepoInRepoList(repoInfo) {
        let map = this.repoList.map((info) => {
            return info.dir;
        });
        if (map.indexOf(repoInfo.dir) === -1) {
            this.repoList.push(repoInfo);
        }
    }

    getProjectsFolders(opts) {
        let options = Object.assign({
            subFolder: ''
        }, opts);

        return new Promise((resolve, reject) => {
            try {
                var isFolderConfigured = vscode.workspace.getConfiguration('gitProjectManager').has('baseProjectsFolders');

                if (!isFolderConfigured) {
                    reject('You need to configure at least on folder in "gitProjectManager.baseProjectsFolders" before search for projects.');
                    return;
                }

                var baseProjectsFolders = options.subFolder == '' ? vscode.workspace.getConfiguration('gitProjectManager').get('baseProjectsFolders') : [options.subFolder];
                var resolvedProjectsFolders = baseProjectsFolders.map(path => {
                    return this.resolveEnvironmentVariables(process.platform, path);
                })
                resolve(resolvedProjectsFolders);
            } catch (error) {
                reject(error);
            }
        });
    }

    resolveEnvironmentVariables(processPlatform, aPath) {
        var envVarMatcher = processPlatform === 'win32' ? /%([^%]+)%/g : /\$([^\/]+)/g;
        let resolvedPath = aPath.replace(envVarMatcher, function (_, key) {
            return process.env[key];
        });

        return resolvedPath.charAt(0) == '~' ? path.join(process.env.HOME, resolvedPath.substr(1)) : resolvedPath;
    };
    showProjectList(opts) {
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

        var projectsPromise = this.getProjectsFolders(opts)
            .then(folders => this.getProjectsList(folders))
            .catch(this.handleError);

        vscode.window.showQuickPick(projectsPromise, options).then(onResolve, onReject);
    };

    /**
     * Adds all projects added as unversioned in vsCode config
     * 
     * @param {DirList} dirList
     */
    addUnversionedProjects(dirList) {
        let unversioned = vscode.workspace.getConfiguration('gitProjectManager').get('unversionedProjects', []);
        unversioned.forEach(proj => dirList.add(proj));
        return dirList.dirs;
    }

    updateRepoList(dirList, directories) {
        dirList.forEach(this.addRepoInRepoList);
        this.saveRepositoryInfo(directories);
        return dirList;
    }

    getProjectsList(directories) {
        return new Promise((resolve, reject) => {
            try {
                this.repoList = this.storedLists.get(this.getDirectoriesHash(directories));
                if (this.repoList) {
                    resolve(this.getQuickPickList());
                    return;
                }

                this.clearProjectList()
                if (this.loadRepositoryInfo()) {
                    resolve(this.getQuickPickList());
                    return;
                }

                projectLocator.locateGitProjects(directories)
                    .then(this.addUnversionedProjects)
                    .then(dirList => this.updateRepoList(dirList, directories))
                    .then()
                    .then(() => resolve(this.getQuickPickList()));
            } catch (error) {
                reject(error);
            }
        });
    };

    openProjectViaShell(projPath) {

        let codePath = this.getCodePath();
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

    openProject(pickedObj) {
        let projectPath = typeof (pickedObj) == 'string' ? pickedObj : this.getProjectPath(pickedObj),
            uri = vscode.Uri.file(projectPath),
            newWindow = vscode.workspace.getConfiguration(
                'gitProjectManager'
            ).get(
                'openInNewWindow', false
                );

        this.recentList.addProject(projectPath, '');
        vscode.commands.executeCommand('vscode.openFolder', uri, newWindow);
    }

    getCodePath() {
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

    getProjectPath(pickedObj) {
        let checkRemoteCfg = vscode.workspace.getConfiguration('gitProjectManager').get('checkRemoteOrigin', false);
        if (!checkRemoteCfg)
            return pickedObj.description;

        let map = this.repoList.map(proj => {
            return checkRemoteCfg ? `${proj.name}.${proj.repo}` : `${proj.name}.${proj.dir}`
        });
        return this.repoList[map.indexOf(`${pickedObj.label}.${pickedObj.description}`)].dir;
    }

    internalRefresh(folders, suppressMessage) {
        this.storedLists = new Map();
        this.getProjectsList(folders)
            .then(() => {
                if (!suppressMessage) {
                    vscode.window.setStatusBarMessage('Git Project Manager - Project List Refreshed');
                }
            })
            .catch((error) => {
                if (!suppressMessage) {
                    this.handleError(error);
                }
            });
    }

    clearProjectList() {
        this.repoList = [];
        projectLocator.clearDirList();
    }

    refreshList(suppressMessage) {
        this.clearProjectList();
        this.getProjectsFolders()
            .then((folders) => {
                this.internalRefresh(folders, suppressMessage);
            })
            .catch((error) => {
                if (!suppressMessage) {
                    this.handleError(error);
                }
            });
    };

    refreshSpecificFolder() {
        var options = {
            placeHolder: 'Select a folder to open:      (it may take a few seconds to search the folders the first time)'
        };
        this.getProjectsFolders()
            .then((list) => {
                vscode.window.showQuickPick(list, options)
                    .then((selection) => {
                        if (!selection) return;
                        this.internalRefresh([selection]);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            })
            .catch((error) => {
                console.log(error);
            });

    };

    openRecentProjects() {
        let self = this;
        if (this.recentList.list.length === 0) {
            vscode.window.showInformationMessage('It seems you didn\'t opened any project using Git Project Manager yet!')
        }

        vscode.window.showQuickPick(this.recentList.list.map(i => {
            return {
                label: path.basename(i.projectPath),
                description: i.projectPath
            }
        })).then(selected => {
            if (selected) self.openProject(selected.description)
        });
    }

    /**
     * Calculate a hash of directories list
     * 
     * @param {String[]} directories 
     * @returns {string} The hash of directories list
     * 
     * @memberOf GitProjectManager
     */
    getDirectoriesHash(directories) {
        return SHA256(directories.join(''));
    }

    showProjectsFromSubFolder() {
        vscode.window.showQuickPick(this.getProjectsFolders(), {
            placeHolder: 'Pick a folder to see the subfolder projects'
        }).then(folder => {
            if (!folder) return;

            this.showProjectList({
                subFolder: folder
            })
        });
    }

}

module.exports = new GitProjectManager();