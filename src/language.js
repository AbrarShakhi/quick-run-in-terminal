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
			lang.c_cpp("C_compilerPath");
			break;
		case "cpp":
			lang.c_cpp("Cpp_compilerPath");
			break;
		case "python":
			lang.python("Python_interpreterPath");
			break;
		case "rust":
			// TODO: NEED TO CHANGE THE FUNC NAME
			lang.c_cpp("Rust_compilerPath");
			break;
		case "java":
			lang.java();
			break;
		case "javascript":
			lang.python("JavaScript_interpreterPath");
			break;
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
	 * @param {string} iname
	 * @returns {terminal.Cmd[]}
	 */
	python(iname) {
		const interpreter = this.cfg.get(iname);
		let args = [utils.quoted(this.fullpath)];

		this.commands.push(new terminal.Cmd(utils.quoted(interpreter), args));
		return this.commands;
	}

	/**
	 * @param void
	 * @returns {terminal.Cmd[]}
	 */
	java() {
		const compiler = this.cfg.get("Java_CompilerPath");
		const runtime = this.cfg.get("Java_Runtime");

		let filename = [utils.quoted(this.fullpath)];
		let ouputname = [utils.quoted(path.parse(this.fullpath).name)];

		this.commands.push(new terminal.Cmd(utils.quoted(compiler), filename));
		this.commands.push(new terminal.Cmd(utils.quoted(runtime), ouputname));
		return this.commands;
	}

	/**
	 * @param {string} cname
	 * @returns {terminal.Cmd[]}
	 */
	c_cpp(cname) {
		const compiler = this.cfg.get(cname);
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
