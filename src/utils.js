const modPath = require("path");
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

class File {
	/**
	 * @param {vscode.TextDocument} doc
	 */
	constructor(doc) {
		this.doc = doc;
		this.uri = this.doc.uri;

		this.fullpath = this.doc.fileName;
		this.dirloca = this.#getDirLocation();

		this.filename = this.#getFilename();
		this.langId = this.doc.languageId;

		this.filenameWithoutExt = this.filename.split(".")[0];
		this.extname = this.filename.split(".")[1];
	}

	#getDirLocation() {
		if (process.platform === "win32") {
			return this.fullpath.substring(0, this.fullpath.lastIndexOf("\\"));
		} else {
			return this.fullpath.substring(0, this.fullpath.lastIndexOf("/"));
		}
	}

	#getFilename() {
		if (process.platform === "win32") {
			return this.fullpath.split("\\").pop();
		} else {
			return this.fullpath.split("/").pop();
		}
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
	File,
};
