const vscode = require("vscode");
const path = require("path");

const utils = require("./utils");

/**
 * @param {string} command
 * @param {string[]} args
 */
function Cmd(command, args) {
	this.command = command;
	this.args = args;
}

class Terminal {
	/**
	 * @param {Cmd[]} commands
	 * @param {vscode.TextDocument} doc
	 */
	constructor(commands, doc) {
		this.commands = commands;
		this.dir = path.dirname(path.normalize(doc.fileName));
		this.shell = utils.getShellname().toLowerCase();
		this.terminame = "Quick-Run";

		this.term = this.#initTerm();
		this.runnerScript = this.#finalizeCommand();
	}

	/**
	 * @returns {vscode.Terminal}
	 */
	#initTerm() {
		for (let i = 0; i < vscode.window.terminals.length; i++) {
			if (vscode.window.terminals[i].name === this.terminame) {
				// TODO: NEED A BETTER WAY TO FIND EXISTING TERMINAL
				// if (vscode.window.terminals[i].processId)
				return vscode.window.terminals[i];
			}
		}
		// TODO: NEED TO PLAY WITH THIS
		return vscode.window.createTerminal(this.terminame);
	}

	/**
	 * @returns {string | undefined}
	 */
	#finalizeCommand() {
		if (
			vscode.workspace
				.getConfiguration("quickRunInTerminal")
				.get("clearBeforeRun")
		) {
			this.commands.unshift(new Cmd(utils.quoted(utils.getClear()), []));
		}

		this.commands.unshift(
			new Cmd(utils.quoted("cd"), [utils.quoted(this.dir)])
		);

		if (this.commands.length < 1) {
			return undefined;
		}
		// TODO: NEED TO COMPARE WITHOUT .exe
		// to utils.js cmd.exe as well
		let isPwsh = this.shell === "powershell.exe" || this.shell === "pwsh.exe";

		let cmdSep = " && ";
		const cmdEnd = " ; ";
		let preSign = "";
		if (isPwsh) {
			preSign = "& ";
			cmdSep = cmdEnd;
		}

		// TODO: NEED TO DECOMPOSE INTO FUNCTIONS;
		let script = "";
		let singleCmd = preSign + this.commands[0].command;
		for (let i = 0; i < this.commands[0].args.length; i++) {
			singleCmd += ` ${this.commands[0].args[i]}`;
		}
		script += singleCmd + (1 == this.commands.length ? cmdEnd : cmdSep);

		// TODO: NEED TO MAKE IT LESS COMPLEX
		for (let i = 1; i < this.commands.length; i++) {
			singleCmd = preSign + this.commands[i].command;
			for (let j = 0; j < this.commands[i].args.length; j++) {
				singleCmd += ` ${this.commands[i].args[j]}`;
			}
			script += singleCmd + (i + 1 == this.commands.length ? cmdEnd : cmdSep);
		}
		console.log(script);
		return script;
	}

	/**
	 * @param void
	 * @returns {boolean}
	 */
	run() {
		if (!this.runnerScript || !this.term) {
			return false;
		}
		this.term.show();
		this.term.sendText("");
		this.term.sendText(this.runnerScript);
		return true;
	}
}

module.exports = { Terminal, Cmd };
