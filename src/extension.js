// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

	console.log('"git-project-manager" is now active!');
	
	var projectManager = require('./gitProjectManager');

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
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
    //clear things
}
exports.deactivate = deactivate;