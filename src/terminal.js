const vscode = require("vscode");
const path = require("path");

const utils = require("./utils");
const shell = require("./shell");

/**
 * @param {string} command
 * @param {string[]} args
 */
function Cmd(command, args) {
	this.command = command;
	this.args = args;
}

const TERMINAL_NAME = "Quick-Run";

class Terminal {
	/**
	 * @param {Cmd[]} commands
	 * @param {vscode.TextDocument} doc
	 */
	constructor(commands, doc) {
		this.commands = commands;
		this.dir = path.dirname(path.normalize(doc.fileName));
		this.family = utils.getShellFamily();

		const cfg = vscode.workspace.getConfiguration("quickRunInTerminal");
		this.runnerScript = shell.buildScript(this.commands, {
			dir: this.dir,
			family: this.family,
			clear: !!cfg.get("clearBeforeRun"),
		});
		this.stopPrevious = !!cfg.get("stopPreviousRun");
		this.reused = false;
		this.term = this.#initTerm();
	}

	/**
	 * @returns {vscode.Terminal}
	 */
	#initTerm() {
		const existing = vscode.window.terminals.find(
			(t) => t.name === TERMINAL_NAME
		);
		if (existing && existing.exitStatus === undefined) {
			this.reused = true;
			return existing;
		}
		if (existing) {
			existing.dispose();
		}
		return vscode.window.createTerminal(TERMINAL_NAME);
	}

	/**
	 * @returns {boolean}
	 */
	run() {
		if (!this.runnerScript || !this.term) {
			return false;
		}
		this.term.show();
		if (this.reused && this.stopPrevious) {
			// Ctrl+C: stops a program from the last run that is still going
			this.term.sendText("\x03", false);
		}
		this.term.sendText(this.runnerScript);
		return true;
	}
}

module.exports = { Terminal, Cmd };
