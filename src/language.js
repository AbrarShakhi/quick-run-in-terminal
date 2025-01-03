const vscode = require("vscode");
const utils = require("./utils.js");

class Language {
	/**
	 * @param {utils.File} file
	 */
	constructor(file) {
		this.file = file;
	}

	/**
	 * @param void
	 * @returns { string[] | undefined}
	 */
	buildCommand() {
		console.log(this.file.langId);

		switch (this.file.langId) {
			case "c":
				// TODO: C
				break;
			case "cpp":
				// TODO: C++
				break;
			case "python":
				// TODO: python
				break;
			case "csharp":
				// TODO: csharp
				break;
		}
		return undefined;
	}
}

module.exports = { Language };
