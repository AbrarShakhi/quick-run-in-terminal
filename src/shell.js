// Pure helpers (no `vscode` import) so they can be unit tested without the editor.

/**
 * @typedef {"cmd" | "powershell" | "fish" | "posix"} ShellFamily
 */

/**
 * Works out which syntax family a shell belongs to.
 * Handles `/bin/pwsh`, `C:\...\PowerShell.EXE`, `cmd.exe`, ...
 * @param {string} shellPath value of `vscode.env.shell`
 * @returns {ShellFamily}
 */
function shellFamily(shellPath) {
	const name = String(shellPath || "")
		.split(/[\\/]/)
		.pop()
		.toLowerCase()
		.replace(/\.exe$/, "");

	if (name === "cmd") {
		return "cmd";
	}
	if (name === "powershell" || name === "pwsh") {
		return "powershell";
	}
	if (name === "fish") {
		return "fish";
	}
	return "posix";
}

/**
 * Quotes one word for the given shell. Plain words stay unquoted.
 * @param {string} text
 * @param {ShellFamily} family
 * @returns {string}
 */
function quote(text, family) {
	const value = String(text);
	const winLike = family === "cmd" || family === "powershell";
	const safe = winLike ? /^[\w.\-+=,@:\\/]+$/ : /^[\w.\-+=,@:/]+$/;
	if (value !== "" && safe.test(value)) {
		return value;
	}

	switch (family) {
		case "cmd":
			// cmd has no escape for `"`, but Windows file names can't contain one.
			return `"${value}"`;
		case "powershell":
			return `'${value.replace(/'/g, "''")}'`;
		case "fish":
			return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
		default:
			return `'${value.replace(/'/g, `'\\''`)}'`;
	}
}

/**
 * @param {ShellFamily} family
 * @returns {string}
 */
function clearCommand(family) {
	if (family === "cmd") {
		return "cls";
	}
	if (family === "powershell") {
		return "Clear-Host";
	}
	return "clear";
}

/**
 * @param {string} dir
 * @param {ShellFamily} family
 * @returns {string}
 */
function cdCommand(dir, family) {
	if (family === "cmd") {
		// /d is needed to switch drive letters
		return `cd /d ${quote(dir, family)}`;
	}
	if (family === "powershell") {
		return `Set-Location -LiteralPath ${quote(dir, family)}`;
	}
	return `cd ${quote(dir, family)}`;
}

/**
 * @param {{command: string, args: string[]}} cmd
 * @param {ShellFamily} family
 * @returns {string}
 */
function commandLine(cmd, family) {
	const words = [cmd.command, ...cmd.args].map((w) => quote(w, family));
	// PowerShell needs the call operator for quoted program names
	return (family === "powershell" ? "& " : "") + words.join(" ");
}

/**
 * Joins lines so that each one only runs when the previous one succeeded.
 * @param {string[]} lines
 * @param {ShellFamily} family
 * @returns {string}
 */
function chain(lines, family) {
	if (family === "powershell") {
		// `&&` doesn't exist in Windows PowerShell 5.1, so guard with `$?`
		return lines.reduceRight((rest, line) =>
			rest === "" ? line : `${line}; if ($?) { ${rest} }`, "");
	}
	if (family === "fish") {
		return lines.join("; and ");
	}
	return lines.join(" && ");
}

/**
 * Builds the single line that is typed into the terminal.
 * @param {{command: string, args: string[]}[]} commands
 * @param {{dir: string, family: ShellFamily, clear?: boolean}} options
 * @returns {string}
 */
function buildScript(commands, options) {
	const { dir, family, clear = false } = options;
	const lines = [cdCommand(dir, family)];
	if (clear) {
		lines.push(clearCommand(family));
	}
	for (const cmd of commands) {
		lines.push(commandLine(cmd, family));
	}
	return chain(lines, family);
}

module.exports = {
	shellFamily,
	quote,
	clearCommand,
	cdCommand,
	buildScript,
};
