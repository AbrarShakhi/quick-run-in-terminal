const vscode = require("vscode");
const path = require("path");

/**
 * @param {vscode.Uri} uri
 */
function saveFiles(uri) {
  const cfg = vscode.workspace.getConfiguration("quickRunInTerminal");
  if (cfg.get("saveAllFilesBeforeRun")) {
    vscode.workspace.saveAll();
  } else {
    vscode.workspace.save(uri);
  }
}

/**
 * @returns {string}
 */
function getShellname() {
  return path.basename(path.normalize(vscode.env.shell));
}

/**
 * @returns {string} "cls" | "clear"
 */
function getClear() {
  const shellname = getShellname().toLowerCase();
  if (shellname === "cmd.exe") {
    return "cls";
  } else {
    return "clear";
  }
}

/**
 * @param {string} inside
 * @param {string} quote
 * @returns {string}
 */
function quoted(inside, quote = '"') {
  return `${quote}${inside}${quote}`;
}

module.exports = {
  saveFiles,
  getClear,
  getShellname,
  quoted,
};
