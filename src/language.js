const vscode = require("vscode");
const path = require("path");

/**
 * @param {vscode.TextDocument} doc
 * @returns {string[] | undefined}
 */
function build(doc) {
	const file = path.parse(path.normalize(doc.fileName));
	const cfg = vscode.workspace.getConfiguration("quickRunInTerminal");
	const lang = new Language(doc, file, cfg);

	switch (doc.languageId) {
		case "c":
			lang.c_cpp(cfg.get("C_compilerPath"));
			break;
		case "cpp":
			lang.c_cpp(cfg.get("Cpp_compilerPath"));
			break;
		case "python":
			lang.python();
			break;
		case "rust":
		// TODO: make a runst runner and uncomment 'break' statement
		// break;
		default:
			console.log(doc.languageId);
			return undefined;
	}
	return lang.commands;
}

class Language {
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
		console.log(outname);

		this.commands.push(`${compiler} "${this.fullpath}" -o "${outname}"`);

		this.commands.push(outname);

		return this.commands;
	}
}

module.exports = { build };
