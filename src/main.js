const vscode = require("vscode");

const utils = require("./utils");
const terminal = require("./terminal");
const language = require("./language");

/**
 * Picks the document to run: the file that was clicked (Explorer / editor
 * menu), otherwise the active editor.
 * @param {vscode.Uri | undefined} uri
 * @returns {Promise<vscode.TextDocument | undefined>}
 */
async function pickDocument(uri) {
	if (uri instanceof vscode.Uri) {
		return vscode.workspace.openTextDocument(uri);
	}
	return vscode.window.activeTextEditor?.document;
}

/**
 * @param {vscode.Uri | undefined} uri
 */
async function run(uri) {
	const doc = await pickDocument(uri);
	if (!doc || !doc.uri) {
		return;
	}

	let built;
	try {
		built = language.build(doc);
	} catch (err) {
		if (err instanceof language.ConfigError) {
			const choice = await vscode.window.showErrorMessage(
				err.message,
				"Open Settings"
			);
			if (choice === "Open Settings") {
				vscode.commands.executeCommand(
					"workbench.action.openSettings",
					`quickRunInTerminal.${err.setting}`
				);
			}
			return;
		}
		throw err;
	}

	if (!built) {
		vscode.window.showErrorMessage(`${doc.languageId} is not supported yet`);
		return;
	}

	// The terminal may have a different PATH than VS Code, so only warn.
	const missing = built.tools.find((t) => !utils.commandExists(t.program));
	if (missing) {
		const choice = await vscode.window.showWarningMessage(
			`Could not find "${missing.program}". Install it or fix the path in settings.`,
			"Open Settings",
			"Run anyway"
		);
		if (choice === "Open Settings") {
			vscode.commands.executeCommand(
				"workbench.action.openSettings",
				`quickRunInTerminal.${missing.setting}`
			);
			return;
		}
		if (choice !== "Run anyway") {
			return;
		}
	}

	await utils.saveFiles(doc.uri);

	new terminal.Terminal(built.commands, doc).run();
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const disposable = vscode.commands.registerCommand(
		"quickRunInTerminal.run",
		run
	);
	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
