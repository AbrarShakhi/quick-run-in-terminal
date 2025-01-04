const vscode = require("vscode");
const log = require("console").log;

const utils = require("./utils");
const terminal = require("./terminal");
const language = require("./language");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	log('"quick-run-in-terminal" is now active!');

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

			let commands = new language.Language(doc).buildCommand();
			if (!commands) {
				vscode.window
					.showErrorMessage("Supported files: [C, C++, python]", "OK")
					.then();
				return;
			}

			//   const term = new terminal.Terminal(commands, file);
			//   if (term.build()) {
			//     term.run();
			//   } else {
			//   }
		}
	);

	context.subscriptions.push(disposable);
}

function deactivate() {
	log('"quick-run-in-terminal" is deactivated!');
}

module.exports = {
	activate,
	deactivate,
};
