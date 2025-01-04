const log = require("console").log;
const vscode = require("vscode");

/**
 * @param {vscode.Uri} uri
 */
function saveFiles(uri) {
	const cfg = vscode.workspace.getConfiguration("quickRunInTerminal");
	if (cfg.get("saveAllFilesBeforeRun")) {
		vscode.workspace.saveAll();
	} else {
		vscode.workspace.save(uri);
	}
}

/**
 * @returns {string} "cls" | "clear"
 */
function getClear() {
	if (vscode.env.shell.includes("cmd.exe")) {
		return "cls";
	} else {
		return "clear";
	}
}

module.exports = {
	saveFiles,
	getClear,
};
