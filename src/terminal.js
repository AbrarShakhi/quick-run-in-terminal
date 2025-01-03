const utils = require("./utils");

class Terminal {
  constructor(vscode, uri) {
    this.vscode = vscode;
    this.cfg = this.vscode.workspace.getConfiguration("quickRunInTerminal");
    this.uri = uri;


    this.cmd = [];
  }

  buildCCpp(compiler) {
    let outname = this.cfg.get("binaryOutputName");
    if (outname == "") {
      outname = this.filename;
    }
    if (process.platform == "win32") {
      outname = outname + ".exe";
    } else {
      outname = outname + ".out";
    }
    this.cmd.push(`${compiler} "${this.filepath}" -o "${outname}"`);
    if (this.vscode.env.shell.includes("cmd.exe")) {
      this.cmd.push(`.\\"${outname}"`);
    } else {
      this.cmd.push(`./"${outname}"`);
    }
    return true;
  }

  buildPython() {
    const compiler = this.cfg.get("Python_interpreterPath");
    this.cmd.push(`${compiler} "${this.filepath}"`);
    return true;
  }

  build() {
    this.cmd.push(`cd "${this.dirlocation}"`);

    if (this.cfg.get("clearBeforeRun")) {
      this.cmd.push(utils.getClear(this.vscode));
    }

    switch (this.extname) {
      case "c":
        return this.buildCCpp(this.cfg.get("C_compilerPath"));
      case "cpp":
        return this.buildCCpp(this.cfg.get("Cpp_compilerPath"));
      case "py":
        return this.buildPython();
    }
    return false;
  }

  run() {
    let operator = ";";
    if (
      this.vscode.env.shell.includes("cmd.exe") ||
      this.vscode.env.shell.includes("bash") ||
      this.vscode.env.shell.includes("fish") ||
      this.vscode.env.shell.includes("zsh")
    ) {
      operator = "&&";
    }

    let command = this.cmd[0];
    for (let i = 1; i < this.cmd.length; i++) {
      command += ` ${operator} ${this.cmd[i]}`;
    }

    let term = null;
    const terminalName = "Quick Run";
    const terminals = this.vscode.window.terminals;
    for (let i = 0; i < terminals.length; i++) {
      if (terminals[i].name === terminalName) {
        term = terminals[i];
      }
    }
    if (!term) {
      term = this.vscode.window.createTerminal(terminalName);
    }
    if (term) {
      term.show(true);
      term.sendText(command, true);
      console.log(command);
    }
  }
}

module.exports = { Terminal };
