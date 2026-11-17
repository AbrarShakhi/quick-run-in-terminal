const assert = require("assert");
const { shellFamily, quote, buildScript } = require("../src/shell");

suite("shell helpers", () => {
	test("shellFamily detects shells with and without .exe", () => {
		assert.strictEqual(shellFamily("C:\\Windows\\System32\\cmd.exe"), "cmd");
		assert.strictEqual(shellFamily("C:\\Program Files\\PowerShell\\7\\pwsh.exe"), "powershell");
		assert.strictEqual(shellFamily("C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\PowerShell.EXE"), "powershell");
		assert.strictEqual(shellFamily("/usr/bin/pwsh"), "powershell");
		assert.strictEqual(shellFamily("/usr/bin/fish"), "fish");
		assert.strictEqual(shellFamily("/bin/bash"), "posix");
		assert.strictEqual(shellFamily("C:\\Program Files\\Git\\bin\\bash.exe"), "posix");
		assert.strictEqual(shellFamily(undefined), "posix");
	});

	test("quote leaves plain words alone", () => {
		assert.strictEqual(quote("g++", "posix"), "g++");
		assert.strictEqual(quote("-o", "powershell"), "-o");
		assert.strictEqual(quote("C:\\a\\b.exe", "cmd"), "C:\\a\\b.exe");
	});

	test("quote protects spaces and special characters", () => {
		assert.strictEqual(quote("my file.c", "posix"), "'my file.c'");
		assert.strictEqual(quote("a$b`c", "posix"), "'a$b`c'");
		assert.strictEqual(quote("it's", "posix"), "'it'\\''s'");
		assert.strictEqual(quote("it's", "powershell"), "'it''s'");
		assert.strictEqual(quote("it's", "fish"), "'it\\'s'");
		assert.strictEqual(quote("C:\\my dir\\a.c", "cmd"), '"C:\\my dir\\a.c"');
		assert.strictEqual(quote("", "posix"), "''");
	});

	test("posix backslash paths are quoted (backslash is an escape there)", () => {
		assert.strictEqual(quote("C:\\a\\b.c", "posix"), "'C:\\a\\b.c'");
	});
});

suite("buildScript", () => {
	const cmds = [
		{ command: "g++", args: ["/w/a b.cpp", "-o", "/w/a b.out"] },
		{ command: "/w/a b.out", args: [] },
	];

	test("bash chains with && so a failed compile stops the run", () => {
		assert.strictEqual(
			buildScript(cmds, { dir: "/w", family: "posix", clear: true }),
			"cd /w && clear && g++ '/w/a b.cpp' -o '/w/a b.out' && '/w/a b.out'"
		);
	});

	test("cmd uses cd /d to change drive", () => {
		const s = buildScript([{ command: "python", args: ["D:\\x y\\a.py"] }], {
			dir: "D:\\x y",
			family: "cmd",
			clear: true,
		});
		assert.strictEqual(s, 'cd /d "D:\\x y" && cls && python "D:\\x y\\a.py"');
	});

	test("powershell guards each step with $? (no stale binary)", () => {
		const s = buildScript(cmds, { dir: "C:\\w", family: "powershell" });
		assert.strictEqual(
			s,
			"Set-Location -LiteralPath C:\\w; if ($?) { & g++ '/w/a b.cpp' -o '/w/a b.out'; if ($?) { & '/w/a b.out' } }"
		);
		assert.ok(!s.includes("&&"));
	});

	test("fish uses `; and`", () => {
		const s = buildScript([{ command: "node", args: ["a.js"] }], { dir: "/w", family: "fish" });
		assert.strictEqual(s, "cd /w; and node a.js");
	});

	test("clear is skipped when disabled", () => {
		const s = buildScript([{ command: "node", args: ["a.js"] }], { dir: "/w", family: "posix" });
		assert.strictEqual(s, "cd /w && node a.js");
	});
});
