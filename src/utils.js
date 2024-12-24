
function saveFiles(vscode, cfg, uri) {
    if (cfg.get('saveAllFilesBeforeRun')) {
        vscode.workspace.saveAll();
    } else {
        vscode.workspace.save(uri);
    }
}

function getDirLocation(path) {
    if (process.platform === 'win32') {
        return path.substring(0, path.lastIndexOf("\\"));
    } else {
        return path.substring(0, path.lastIndexOf("/"));
    }
}

function getFilename(path) {
    if (process.platform === 'win32') {
        return path.split("\\").pop().split(".")[0];
    } else {
        return path.split("/").pop().split(".")[0];
    }
}




module.exports = { saveFiles, getDirLocation, getFilename };