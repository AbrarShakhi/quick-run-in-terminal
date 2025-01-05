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

			const commands = language.build(doc);
			if (!commands) {
				vscode.window
					.showErrorMessage(
						`${doc.languageId} is not supported yet`
						// "Request this language"
					)
					.then((clicked) => {
						// console.log("got value: " + clicked);
					});
				return;
			}

			const term = new terminal.Terminal(commands, doc);
			//   if (term.build()) {
			term.run();
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
