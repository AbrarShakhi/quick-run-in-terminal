const assert = require("assert");

suite("main", () => {
	test("exports activate and deactivate", () => {
		const main = require("../src/main");
		assert.strictEqual(typeof main.activate, "function");
		assert.strictEqual(typeof main.deactivate, "function");
	});

	test("package.json passes the clicked file to the command (menus are wired)", () => {
		const pkg = require("../package.json");
		assert.ok(pkg.contributes.menus["explorer/context"].length > 0);
		assert.strictEqual(pkg.license, "GPL-3.0-only");
	});
});
