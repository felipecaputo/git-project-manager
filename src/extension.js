// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var projectManager = require('./gitProjectManager');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

	var disposable = vscode.commands.registerCommand('gitProjectManager.openProject', function () {       		
          projectManager.showProjectList();
		
	});
    
	var refreshDisposable = vscode.commands.registerCommand('gitProjectManager.refreshProjects', function () {
        projectManager.refreshList();	
	});
    
    var specificRefreshDisposable = vscode.commands.registerCommand('gitProjectManager.refreshFolder', function () {
        projectManager.refreshSpecificFolder();	
	});

	context.subscriptions.push(disposable, refreshDisposable, specificRefreshDisposable);
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(projectManager.refreshList.bind(projectManager, true)));
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
    //clear things
}
exports.deactivate = deactivate;