const vscode = require("vscode");
const log = require("console").log;
const path = require("path");

const utils = require("./utils.js");

class Language {
	/**
	 * @param {vscode.TextDocument} doc
	 */
	constructor(doc) {
		this.doc = doc;
		this.file = path.parse(path.normalize(this.doc.fileName));
	}

	/**
	 * @param void
	 * @returns {string[] | undefined}
	 */
	buildCommand() {
		let cfg = vscode.workspace.getConfiguration("quickRunInTerminal");
		const build = new Build(this.doc, this.file, cfg);

		switch (this.doc.languageId) {
			case "c":
				build.c_cpp(cfg.get("C_compilerPath"));
				break;
			case "cpp":
				build.c_cpp(cfg.get("Cpp_compilerPath"));
				break;
			case "python":
				build.python();
				break;
			default:
				return undefined;
		}
		return build.commands;
	}
}

class Build {
	/**
	 * @param {vscode.TextDocument} doc
	 * @param {path.ParsedPath} file
	 * @param {vscode.WorkspaceConfiguration} cfg
	 */
	constructor(doc, file, cfg) {
		this.doc = doc;
		this.file = file;
		this.fullpath = path.normalize(this.doc.fileName);
		this.cfg = cfg;
		this.commands = [];
	}

	/**
	 * @param void
	 * @returns {string[]}
	 */
	python() {
		const interpreter = this.cfg.get("Python_interpreterPath");
		this.commands.push(`${interpreter} "${this.fullpath}"`);
		return this.commands;
	}

	/**
	 * @param {string} compiler
	 * @returns {string[]}
	 */
	c_cpp(compiler) {
		let outname = this.cfg.get("binaryOutputName");
		if (outname == "") {
			outname = path.parse(this.fullpath).name;
		}
		if (process.platform == "win32") {
			outname = outname + ".exe";
		} else {
			outname = outname + ".out";
		}

		outname = path.join(path.parse(this.fullpath).dir, outname);
		log(outname);

		this.commands.push(`${compiler} "${this.fullpath}" -o "${outname}"`);

		this.commands.push(outname);

		return this.commands;
	}
}
module.exports = { Language };
