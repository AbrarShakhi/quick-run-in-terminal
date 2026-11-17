// Pure helper (no `vscode` import) so it can be unit tested without the editor.
const path = require("path");

/**
 * Looks at a Java source file and decides where to compile it and what to run.
 *
 * - `package a.b;` -> classes go to the source root (two folders above the file
 *   when the folder layout matches) and the main class is `a.b.Name`.
 * - The class name comes from the first top level type, not the file name.
 *
 * @param {string} source file content
 * @param {string} filePath full path of the file
 * @returns {{root: string, mainClass: string}}
 */
function javaPlan(source, filePath) {
	const code = source
		.replace(/\/\*[\s\S]*?\*\//g, " ")
		.replace(/\/\/.*$/gm, " ");

	const pkg = /^\s*package\s+([\w.]+)\s*;/m.exec(code);
	const type = /^\s*(?:(?:public|final|abstract|sealed|strictfp)\s+)*(?:class|interface|enum|record)\s+(\w+)/m.exec(
		code
	);

	const fileDir = path.dirname(filePath);
	const name = type ? type[1] : path.parse(filePath).name;

	if (!pkg) {
		return { root: fileDir, mainClass: name };
	}

	const parts = pkg[1].split(".");
	const dirParts = path.normalize(fileDir).split(path.sep);
	const tail = dirParts.slice(-parts.length);
	const layoutMatches =
		tail.length === parts.length && tail.every((p, i) => p === parts[i]);

	// If the folders don't mirror the package, fall back to the file's folder
	// so javac still produces something runnable.
	const root = layoutMatches
		? path.resolve(fileDir, ...parts.map(() => ".."))
		: fileDir;

	return { root, mainClass: `${pkg[1]}.${name}` };
}

module.exports = { javaPlan };
