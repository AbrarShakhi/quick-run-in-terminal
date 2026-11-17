const vscode = require("vscode");
const path = require("path");

const terminal = require("./terminal");
const { javaPlan } = require("./java");

/**
 * Thrown when a setting the run needs is empty.
 */
class ConfigError extends Error {
	/**
	 * @param {string} message
	 * @param {string} setting short setting name, e.g. "C_compilerPath"
	 */
	constructor(message, setting) {
		super(message);
		this.setting = setting;
	}
}

/**
 * @typedef {{ commands: terminal.Cmd[], tools: {setting: string, program: string}[] }} BuildResult
 */

/**
 * @param {vscode.TextDocument} doc
 * @returns {BuildResult | undefined} undefined when the language is not supported
 * @throws {ConfigError}
 */
function build(doc) {
	const file = path.parse(path.normalize(doc.fileName));
	const cfg = vscode.workspace.getConfiguration("quickRunInTerminal");
	const lang = new Language(doc, file, cfg);

	switch (doc.languageId) {
		case "c":
			lang.compiled("C_compilerPath");
			break;
		case "cpp":
			lang.compiled("Cpp_compilerPath");
			break;
		case "rust":
			lang.compiled("Rust_compilerPath");
			break;
		case "python":
			lang.interpreted("Python_interpreterPath");
			break;
		case "javascript":
			lang.interpreted("JavaScript_interpreterPath");
			break;
		case "java":
			lang.java();
			break;
		default:
			return undefined;
	}
	return { commands: lang.commands, tools: lang.tools };
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
		/** @type {terminal.Cmd[]} */
		this.commands = [];
		/** @type {{setting: string, program: string}[]} */
		this.tools = [];
	}

	/**
	 * Reads a program setting and refuses an empty value.
	 * @param {string} setting
	 * @returns {string}
	 */
	tool(setting) {
		const value = String(this.cfg.get(setting) ?? "").trim();
		if (value === "") {
			throw new ConfigError(
				`"quickRunInTerminal.${setting}" is empty. Set it to a program name or path.`,
				setting
			);
		}
		this.tools.push({ setting, program: value });
		return value;
	}

	/**
	 * Python, JavaScript: `<interpreter> <file>`
	 * @param {string} setting
	 */
	interpreted(setting) {
		const interpreter = this.tool(setting);
		this.commands.push(new terminal.Cmd(interpreter, [this.fullpath]));
	}

	/**
	 * Java: compile into the source root, run the main class by its full name.
	 */
	java() {
		const compiler = this.tool("Java_CompilerPath");
		const runtime = this.tool("Java_Runtime");
		const { root, mainClass } = javaPlan(this.doc.getText(), this.fullpath);

		this.commands.push(
			new terminal.Cmd(compiler, ["-d", root, this.fullpath])
		);
		this.commands.push(new terminal.Cmd(runtime, ["-cp", root, mainClass]));
	}

	/**
	 * C, C++, Rust: `<compiler> <file> -o <binary>` then run the binary.
	 * @param {string} setting
	 */
	compiled(setting) {
		const compiler = this.tool(setting);
		const outname = this.binaryName();

		this.commands.push(
			new terminal.Cmd(compiler, [this.fullpath, "-o", outname])
		);
		this.commands.push(new terminal.Cmd(outname, []));
	}

	/**
	 * Full path of the binary. Uses the `binaryOutputName` setting if set,
	 * and never doubles the extension (`app.exe` stays `app.exe`).
	 * @returns {string}
	 */
	binaryName() {
		const ext = process.platform === "win32" ? ".exe" : ".out";
		let name = String(this.cfg.get("binaryOutputName") ?? "").trim();
		// only a file name is allowed, not a path
		name = path.basename(name);
		if (name === "") {
			name = this.file.name;
		}
		if (!name.toLowerCase().endsWith(ext)) {
			name += ext;
		}
		return path.join(this.file.dir, name);
	}
}

module.exports = { build, ConfigError };
