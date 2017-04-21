// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const ProjectManager = require('./gitProjectManager');
const Config = require('./config');
const cfg = new Config(vscode.workspace.getConfiguration('gitProjectManager'))
const projectManager = new ProjectManager(cfg);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    let disposable = vscode.commands.registerCommand('gitProjectManager.openProject', function () {
        projectManager.showProjectList(false);
    });

    let newWindowdisposable = vscode.commands.registerCommand('gitProjectManager.openProjectNewWindow', function () {
        projectManager.showProjectList(true);
    });

    let subFoldersDisposable = vscode.commands.registerCommand('gitProjectManager.openSubFolder', function () {
        projectManager.showProjectsFromSubFolder();
    });

    let refreshDisposable = vscode.commands.registerCommand('gitProjectManager.refreshProjects', function () {
        projectManager.refreshList();
    });

    let specificRefreshDisposable = vscode.commands.registerCommand('gitProjectManager.refreshFolder', function () {
        projectManager.refreshSpecificFolder();
    });

    let openRecentDisposable = vscode.commands.registerCommand('gitProjectManager.openRecents', function () {
        projectManager.openRecentProjects();
    });

    context.subscriptions.push(disposable, refreshDisposable, specificRefreshDisposable, openRecentDisposable, subFoldersDisposable, newWindowdisposable);
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => {
        projectManager.config = new Config(vscode.workspace.getConfiguration('gitProjectManager'));
        projectManager.refreshList.bind(projectManager, true);
    }));
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
    //clear things
}
exports.deactivate = deactivate;