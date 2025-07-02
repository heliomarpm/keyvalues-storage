import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { KeyValues } from "../src";

const TEST_DIR = path.resolve(__dirname, "test-data");

describe("KeyValues", () => {
	// Hooks para criar e limpar o diretório de teste antes e depois de cada teste
	beforeEach(async () => {
		await fs.rm(TEST_DIR, { recursive: true, force: true });
		await fs.mkdir(TEST_DIR, { recursive: true });
	});

	afterEach(async () => {
		await fs.rm(TEST_DIR, { recursive: true, force: true });
	});

	it("should initialize with custom options", () => {
		const options = {
			dir: TEST_DIR,
			fileName: "custom-config.json",
		};
		const kvs = new KeyValues(options);
		expect(kvs.file()).toBe(path.join(TEST_DIR, "custom-config.json"));
	});

	describe("Sync Methods", () => {
		let kvs: KeyValues;
		beforeEach(() => {
			kvs = new KeyValues({ dir: TEST_DIR, fileName: "sync-test.json" });
		});

		it("should set and get a nested value", () => {
			kvs.setSync("color.name", "sapphire");
			expect(kvs.getSync("color.name")).toBe("sapphire");
			expect(kvs.getSync("color")).toEqual({ name: "sapphire" });
			expect(kvs.getSync()).toEqual({ color: { name: "sapphire" } });
		});

		it("should set and get a value", () => {
			kvs.setSync("foo", "bar");
			expect(kvs.getSync("foo")).toBe("bar");
		});

		it("should set and get a nested value", () => {
			kvs.setSync("a.b.c", 123);
			expect(kvs.getSync("a.b.c")).toBe(123);
			expect(kvs.getSync("a.b")).toEqual({ c: 123 });
		});
		it("should set and get a array value", () => {
			const data = [""]
			kvs.setSync("a.b.c", 123);
			expect(kvs.getSync("a.b.c")).toBe(123);
			expect(kvs.getSync("a.b")).toEqual({ c: 123 });
		});

		it("should get all values", () => {
			const data = { a: 1, b: { c: 2 } };
			kvs.setSync(data);
			expect(kvs.getSync()).toEqual(data);
		});

		it("should check for a key with hasSync", () => {
			kvs.setSync("foo", "bar");
			expect(kvs.hasSync("foo")).toBe(true);
			expect(kvs.hasSync("baz")).toBe(false);
		});

		it("should unset a value and return true", () => {
			kvs.setSync("foo", "bar");
			expect(kvs.hasSync("foo")).toBe(true);
			const result = kvs.unsetSync("foo");
			expect(result).toBe(true);
			expect(kvs.hasSync("foo")).toBe(false);
		});

		it("should return false when unsetting a non-existent key", () => {
			const result = kvs.unsetSync("nonexistent");
			expect(result).toBe(false);
		});

		it("should unset all values", () => {
			kvs.setSync({ a: 1, b: 2 });
			const result = kvs.unsetSync();
			expect(result).toBe(true);
			expect(kvs.getSync()).toEqual({});
		});
	});

	describe("Async Methods", () => {
		let kvs: KeyValues;

		beforeEach(() => {
			kvs = new KeyValues({ dir: TEST_DIR, fileName: "async-test.json" });
		});

		it("should set and get a value", async () => {
			await kvs.set("foo", "bar");
			const value = await kvs.get("foo");
			expect(value).toBe("bar");
		});

		it("should set and get a nested value", async () => {
			await kvs.set("a.b.c", 123);
			const value = await kvs.get("a.b.c");
			expect(value).toBe(123);
			const nestedObj = await kvs.get("a.b");
			expect(nestedObj).toEqual({ c: 123 });
		});

		it("should get all values", async () => {
			const data = { a: 1, b: { c: 2 } };
			await kvs.set(data);
			const allData = await kvs.get();
			expect(allData).toEqual(data);
		});

		it("should check for a key with has", async () => {
			await kvs.set("foo", "bar");
			expect(await kvs.has("foo")).toBe(true);
			expect(await kvs.has("baz")).toBe(false);
		});

		it("should unset a value and return true", async () => {
			await kvs.set("foo", "bar");
			expect(await kvs.has("foo")).toBe(true);
			const result = await kvs.unset("foo");
			expect(result).toBe(true);
			expect(await kvs.has("foo")).toBe(false);
		});

		it("should return false when unsetting a non-existent key", async () => {
			const result = await kvs.unset("nonexistent2");
			expect(result).toBe(false);
		});

		it("should unset all values", async () => {
			await kvs.set({ a: 1, b: 2 });
			const result = await kvs.unset();
			expect(result).toBe(true);
			const data = await kvs.get();
			expect(data).toEqual({});
		});
	});

	it("should handle prettify option correctly", async () => {
		const kvs = new KeyValues({
			dir: TEST_DIR,
			fileName: "pretty.json",
			prettify: true,
			numSpaces: 4,
		});

		const data = { a: 1, b: [2, 3] };
		kvs.setSync(data);

		const fileContent = await fs.readFile(kvs.file(), "utf-8");
		const expectedContent = JSON.stringify(data, null, 4);

		expect(fileContent).toBe(expectedContent);
	});

	it("should handle errors when loading a malformed JSON file", async () => {
		const filePath = path.join(TEST_DIR, "malformed.json");
		// JSON inválido com uma vírgula a mais
		await fs.writeFile(filePath, '{"key": "value",}');

		const kvs = new KeyValues({ dir: TEST_DIR, fileName: "malformed.json" });

		// Testa o get assíncrono
		await expect(kvs.get()).rejects.toThrow();

		// Testa o get síncrono
		expect(() => kvs.getSync()).toThrow();
	});

	it("should throw a generic error when a non-Error is caught during get()", async () => {
		const kvs = new KeyValues({ dir: TEST_DIR });
		// biome-ignore lint/complexity/useLiteralKeys: needed for dynamic property access in test
		vi.spyOn(kvs["jsonHelper"], "loadKeyValues").mockRejectedValue("a plain string error");

		// Verificamos se o bloco `catch` que trata erros genéricos é acionado
		await expect(kvs.get()).rejects.toThrow("Failed to get value: Unknown error");
	});
});
