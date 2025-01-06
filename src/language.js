const vscode = require("vscode");
const path = require("path");

const terminal = require("./terminal");
const utils = require("./utils");

/**
 * @param {vscode.TextDocument} doc
 * @returns {terminal.Cmd[] | undefined}
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
	 * @returns {terminal.Cmd[]}
	 */
	python() {
		const interpreter = this.cfg.get("Python_interpreterPath");
		let args = [utils.quoted(this.fullpath)];

		this.commands.push(new terminal.Cmd(utils.quoted(interpreter), args));
		return this.commands;
	}

	/**
	 * @param {string} compiler
	 * @returns {terminal.Cmd[]}
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

		this.commands.push(
			new terminal.Cmd(utils.quoted(compiler), [
				utils.quoted(this.fullpath),
				"-o",
				utils.quoted(outname),
			])
		);
		this.commands.push(new terminal.Cmd(utils.quoted(outname), []));

		return this.commands;
	}
}

module.exports = { build };
