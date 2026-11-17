const assert = require("assert");
const vscode = require("vscode");
const fs = require("fs");
const os = require("os");
const path = require("path");

// These run inside the VS Code extension host.
suite("extension", () => {
	test("the run command is registered", async () => {
		const ext = vscode.extensions.getExtension("AbrarShakhi.quick-run-in-terminal");
		await ext?.activate();
		const cmds = await vscode.commands.getCommands(true);
		assert.ok(cmds.includes("quickRunInTerminal.run"));
	});

	test("language.build gives raw commands for C++", async () => {
		const language = require("../src/language");
		const doc = await vscode.workspace.openTextDocument({ language: "cpp", content: "int main(){}" });
		// untitled docs have no real path, only check the shape
		const built = language.build(doc);
		assert.ok(built);
		assert.strictEqual(built.commands.length, 2);
		assert.strictEqual(built.tools[0].setting, "Cpp_compilerPath");
	});

	test("unsupported languages return undefined", async () => {
		const language = require("../src/language");
		const doc = await vscode.workspace.openTextDocument({ language: "markdown", content: "# hi" });
		assert.strictEqual(language.build(doc), undefined);
	});

	test("an empty compiler setting throws ConfigError", async function () {
		this.timeout(15000);
		const language = require("../src/language");
		const cfg = vscode.workspace.getConfiguration("quickRunInTerminal");
		await cfg.update("C_compilerPath", "  ", vscode.ConfigurationTarget.Global);
		try {
			const doc = await vscode.workspace.openTextDocument({ language: "c", content: "int main(){}" });
			assert.throws(() => language.build(doc), language.ConfigError);
		} finally {
			await cfg.update("C_compilerPath", undefined, vscode.ConfigurationTarget.Global);
		}
	});

	test("end to end: runs a real file from a folder with spaces and a quote", async function () {
		this.timeout(40000);
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), "qrit it's "));
		const marker = path.join(dir, "marker.txt");
		const file = path.join(dir, "hello world.js");
		fs.writeFileSync(
			file,
			"require('fs').writeFileSync(require('path').join(__dirname, 'marker.txt'), 'ran:' + process.cwd());"
		);

		try {
			await vscode.commands.executeCommand("quickRunInTerminal.run", vscode.Uri.file(file));
			const deadline = Date.now() + 30000;
			while (!fs.existsSync(marker) && Date.now() < deadline) {
				await new Promise((r) => setTimeout(r, 250));
			}
			assert.ok(fs.existsSync(marker), "script did not run");
			const out = fs.readFileSync(marker, "utf8");
			assert.ok(out.startsWith("ran:"));
			// cd worked: working dir is the file's folder
			assert.strictEqual(fs.realpathSync(out.slice(4)), fs.realpathSync(dir));
		} finally {
			vscode.window.terminals.forEach((t) => t.name === "Quick-Run" && t.dispose());
			fs.rmSync(dir, { recursive: true, force: true });
		}
	});
});
