const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

const shell = require("./shell");

/**
 * Saves the file(s) and waits until VS Code is done writing them.
 * @param {vscode.Uri} uri
 * @returns {Promise<void>}
 */
async function saveFiles(uri) {
	const cfg = vscode.workspace.getConfiguration("quickRunInTerminal");
	if (cfg.get("saveAllFilesBeforeRun")) {
		await vscode.workspace.saveAll();
	} else {
		await vscode.workspace.save(uri);
	}
}

/**
 * @returns {shell.ShellFamily}
 */
function getShellFamily() {
	return shell.shellFamily(vscode.env.shell);
}

/**
 * Checks if a program can be found, either as a path or on PATH.
 * @param {string} program
 * @returns {boolean}
 */
function commandExists(program) {
	const isFile = (p) => {
		try {
			return fs.statSync(p).isFile();
		} catch {
			return false;
		}
	};

	if (/[\\/]/.test(program)) {
		return isFile(program);
	}

	const exts =
		process.platform === "win32"
			? ["", ...(process.env.PATHEXT || ".EXE;.CMD;.BAT").split(";")]
			: [""];
	const dirs = (process.env.PATH || "").split(path.delimiter).filter(Boolean);
	return dirs.some((dir) => exts.some((ext) => isFile(path.join(dir, program + ext))));
}

module.exports = {
	saveFiles,
	getShellFamily,
	commandExists,
};
