const vscode = require("vscode");

const utils = require("./utils");
const terminal = require("./terminal");
const language = require("./language");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('"quick-run-in-terminal" is now active!');

	const disposable = vscode.commands.registerCommand(
		"quickRunInTerminal.run",
		() => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				return;
			}
			const doc = editor.document;
			if (!doc || !doc.uri) {
				return;
			}

			utils.saveFiles(doc.uri);

			const file = new utils.File(doc);

			let commands = new language.Language(file).buildCommand();
			if (!commands) {
				vscode.window
					.showErrorMessage("Supported files: [C, C++, python]", "OK")
					.then();
				return;
			}

			//   const term = new terminal.Terminal(vscode, fileUri);
			//   if (term.build()) {
			//     term.run();
			//   } else {
			//   }
		}
	);

	context.subscriptions.push(disposable);
}

function deactivate() {
	console.log('"quick-run-in-terminal" is deactivated!');
}

module.exports = {
	activate,
	deactivate,
};
