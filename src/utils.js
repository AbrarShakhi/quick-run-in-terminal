const vscode = require("vscode");
const path = require("path");

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
 * @returns {string}
 */
function getShellname() {
	return path.basename(path.normalize(vscode.env.shell));
}

/**
 * @returns {string} "cls" | "clear"
 */
function getClear() {
	const shellname = getShellname().toLowerCase();
	console.log("vscode shellname: " + shellname);
	if (shellname === "cmd.exe") {
		return "cls";
	} else {
		return "clear";
	}
}

module.exports = {
	saveFiles,
	getClear,
	getShellname,
};
