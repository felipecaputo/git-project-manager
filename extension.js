// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "git-project-manager" is now active!');
	var dirList = [];
	
	var projectManager = require('./lib/gitProjectManager');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	var disposable = vscode.commands.registerCommand('extension.sayHello', function () {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		var pickList = [];
		dirList.forEach( (entry) => {
			pickList.push(entry.repo);
		});
		
		function onResolve(selected) {
			projectManager.openProject(selected)
		}
		
		function onReject(reason) {
			vscode.window.showInformationMessage(reason);
		}
		
        var dir = 'D:\\private\\node'; //'/home/felipe/src';

		vscode.window.showQuickPick(projectManager.getProjectsList(dir)).then( onResolve, onReject);
		
	});
	
	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;