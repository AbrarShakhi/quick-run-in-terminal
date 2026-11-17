const assert = require("assert");
const path = require("path");
const { javaPlan } = require("../src/java");

suite("javaPlan", () => {
	const dir = path.resolve("proj", "src");

	test("no package: compile and run from the file folder", () => {
		const r = javaPlan("public class Hello { }", path.join(dir, "Hello.java"));
		assert.deepStrictEqual(r, { root: dir, mainClass: "Hello" });
	});

	test("package: run from the source root with the full class name", () => {
		const file = path.join(dir, "com", "acme", "App.java");
		const r = javaPlan("package com.acme;\npublic class App {}", file);
		assert.deepStrictEqual(r, { root: dir, mainClass: "com.acme.App" });
	});

	test("class name can differ from the file name", () => {
		const r = javaPlan("public class Main {}", path.join(dir, "other.java"));
		assert.strictEqual(r.mainClass, "Main");
	});

	test("comments are ignored", () => {
		const src = "// package fake.pkg;\n/* class Nope */\npublic class Real {}";
		const r = javaPlan(src, path.join(dir, "Real.java"));
		assert.deepStrictEqual(r, { root: dir, mainClass: "Real" });
	});

	test("folders that don't match the package fall back to the file folder", () => {
		const r = javaPlan("package a.b;\nclass X {}", path.join(dir, "X.java"));
		assert.deepStrictEqual(r, { root: dir, mainClass: "a.b.X" });
	});

	test("records, interfaces and enums are found", () => {
		assert.strictEqual(javaPlan("public record P(int x) {}", path.join(dir, "f.java")).mainClass, "P");
		assert.strictEqual(javaPlan("final class Q {}", path.join(dir, "f.java")).mainClass, "Q");
	});
});
