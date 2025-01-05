const vscode = require("vscode");
const path = require("path");

const utils = require("./utils");

class Terminal {
	/**
	 * @param {string[]} commands
	 * @param {vscode.TextDocument} doc
	 */
	constructor(commands, doc) {
		this.commands = commands;
		this.dir = path.dirname(path.normalize(doc.fileName));
		this.shell = utils.getShellname();
		this.terminame = "Quick-Run";

		this.term = this.#initTerm();
		this.runnerString = this.#finalizeCommand();
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
		/**
		 * NB:
		 * type: cd dir; clear; command
		 * command prompt doesnot like: "
		 * pwershell doesnt like: &&
		 * need to put & before running if it has " in powershell
		 * stupid Windows
		 */
		return "";
	}

	/**
	 * @param void
	 * @returns {boolean}
	 */
	run() {
		if (!this.runnerString) return false;
	}
}

module.exports = { Terminal };
