const vscode = require("vscode");
const path = require("path");

const utils = require("./utils");

class Cmd {
  /**
   * @param {string} command
   * @param {string[]} args
   */
  constructor(command, args) {
    this.command = command;
    this.args = args;
  }
}

class Terminal {
  /**
   * @param {Cmd[]} batchCmd
   * @param {vscode.TextDocument} doc
   */
  constructor(batchCmd, doc) {
    this.batchCmd = batchCmd;
    this.dir = path.dirname(path.normalize(doc.fileName));
    this.shell = path.parse(utils.getShellname().toLowerCase()).name;
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
   * @param {Cmd} cmd
   * @param {boolean} isLast
   * @param {string} preSign
   * @param {string} sepSign
   * @param {string} endSign
   * @returns {string}
   */
  #signifyCmd(cmd, isLast, preSign, sepSign, endSign) {
    let singleCmd = preSign + cmd.command;
    for (let i = 0; i < cmd.args.length; i++) {
      singleCmd += ` ${cmd.args[i]}`;
    }
    singleCmd += isLast ? endSign : sepSign;

    return singleCmd;
  }

  /**
   * @returns {string | undefined}
   */
  #finalizeCommand() {
    if (this.batchCmd.length < 1) {
      return undefined;
    }

    if (
      vscode.workspace
        .getConfiguration("quickRunInTerminal")
        .get("clearBeforeRun")
    ) {
      this.batchCmd.unshift(new Cmd(utils.getClear(), []));
    }
    this.batchCmd.unshift(new Cmd("cd", [utils.quoted(this.dir)]));

    const isPwsh = this.shell === "powershell" || this.shell === "pwsh";

    let sepSign = " && ";
    const endSign = " ; ";
    let preSign = "";
    if (isPwsh) {
      preSign = "& ";
      sepSign = endSign;
    }

    let script = this.#signifyCmd(
      this.batchCmd[0],
      0 + 1 === this.batchCmd.length,
      preSign,
      sepSign,
      endSign
    );

    for (let i = 1; i < this.batchCmd.length; i++) {
      script += this.#signifyCmd(
        this.batchCmd[i],
        i + 1 === this.batchCmd.length,
        preSign,
        sepSign,
        endSign
      );
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
