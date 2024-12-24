
const vscode = require('vscode');
const utils = require('./utils.js')
const terminal = require('./terminal.js')


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('"quick-run-in-terminal" is now active!');
	
	const disposable = vscode.commands.registerCommand('quickRunInTerminal.run', function () {
		
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		const fileUri = editor.document.uri;
		if (!fileUri) {
			return;
		}
		
		const cfg = vscode.workspace.getConfiguration('quickRunInTerminal');
		
		utils.saveFiles(vscode, cfg, fileUri);
		
		const term = new terminal.Terminal(vscode, cfg, fileUri);
		if (term.build()) {
			term.run();
		} else {
			vscode.window.showErrorMessage("[Quick run]: Supported files {C, C++, python}");
		}
	});
	
	context.subscriptions.push(disposable);
}

function deactivate() {
	console.log('"quick-run-in-terminal" is now active!');
}

module.exports = {
	activate,
	deactivate
};
