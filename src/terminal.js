
const path = require('path');
const utils = require('./utils.js')


class Terminal {
    constructor(vscode, cfg, uri) {
        this.vscode = vscode
        this.cfg = cfg;
        this.uri = uri;
        this.filepath = path.normalize(uri.fsPath);
        this.dirlocation = utils.getDirLocation(this.filepath);
        this.filename = utils.getFilename(this.filepath);
        this.extname = path.extname(this.filepath).toLowerCase();

        this.cmd = [];
    }

    buildC() {
        const compiler = this.cfg.get('C_compilerPath');
        let outname = this.cfg.get('binaryOutputName');
        if (outname == '') {
            outname = this.filename;
        }
        this.cmd.push(`${compiler} "${this.filepath}" -o "${outname}.out"`);
        if (this.vscode.env.shell.includes('cmd.exe')) {
            this.cmd.push(`".\\${outname}.out"`);
        } else {
            this.cmd.push(`"./${outname}.out"`);
        }
        return true;
    }
    
    buildCpp() {
        const compiler = this.cfg.get('Cpp_compilerPath');
        let outname = this.cfg.get('binaryOutputName');
        if (outname == '') {
            outname = this.filename;
        }
        if (process.platform == 'win32') {
            outname = outname + ".exe";
        } else {
            outname = outname + ".out";
        }
        this.cmd.push(`${compiler} "${this.filepath}" -o "${outname}"`);
        if (this.vscode.env.shell.includes('cmd.exe')) {
            this.cmd.push(`.\\"${outname}"`);
        } else {
            this.cmd.push(`./"${outname}"`);
        }
        return true;
    }
    
    buildPython() {
        const compiler = this.cfg.get('Python_interpreterPath');
        this.cmd.push(`${compiler} "${this.filepath}"`);
        return true;
    }
    
    build() {
        this.cmd.push(`cd "${this.dirlocation}"`);

        if (this.cfg.get('clearBeforeRun')) {
            if (process.platform == 'win32') {
                this.cmd.push('cls');
            } else {
                this.cmd.push('clear');
            }
        }

        switch (this.extname) {
            case '.c':
                return this.buildC();
            case '.cpp':
                return this.buildCpp();
            case '.py':
                return this.buildPython();
        }
        return false;
    }

    run() {
        
        let operator = ';';
        if (
            this.vscode.env.shell.includes('cmd.exe') ||
            this.vscode.env.shell.includes('bash') ||
            this.vscode.env.shell.includes('fish') ||
            this.vscode.env.shell.includes('zsh')
        ) {
            operator = '&&'
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