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