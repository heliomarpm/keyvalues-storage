import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import fs from "node:fs";
import path from "node:path";

import { JsonFileHelper, DEFAULT_DIR_NAME, DEFAULT_FILE_NAME } from "../src/internal/JsonFileHelper";
import writeFileAtomic from "write-file-atomic";

// Mock da dependência para testar o comportamento de 'atomicSave' de forma isolada.
vi.mock("write-file-atomic", () => {
	const asyncFn = vi.fn().mockResolvedValue(undefined);
	const syncFn = vi.fn();
	// A biblioteca 'write-file-atomic' exporta uma função default (async)
	// que também tem a função 'sync' como propriedade.
	// Adicionamos __esModule: true para garantir a interoperabilidade correta com CJS/ESM.
	return { __esModule: true, default: Object.assign(asyncFn, { sync: syncFn }) };
});

const TEST_DIR = path.resolve(__dirname, "test-data-helper");
// Criamos uma referência tipada para o mock para facilitar o uso nos testes
const mockedWriteFileAtomic = vi.mocked(writeFileAtomic);

describe("JsonFileHelper", () => {
	// Hooks para garantir um ambiente limpo para cada teste
	beforeEach(async () => {
		await fs.promises.rm(TEST_DIR, { recursive: true, force: true });
		await fs.promises.mkdir(TEST_DIR, { recursive: true });
	});

	afterEach(async () => {
		vi.restoreAllMocks(); // Restaura as implementações originais de funções espiadas
		vi.clearAllMocks();
		await fs.promises.rm(TEST_DIR, { recursive: true, force: true });
	});

	describe("File Path Resolution", () => {
		it("should resolve to default path when no dir option is provided", () => {
			const helper = new JsonFileHelper({ dir: undefined, fileName: "", atomicSave: false, prettify: false, numSpaces: 2 });
			const expectedPath = path.join(process.cwd(), DEFAULT_DIR_NAME, DEFAULT_FILE_NAME);
			expect(helper.getJsonFilePath()).toBe(expectedPath);
		});

		it("should resolve to custom path when options are provided", () => {
			const helper = new JsonFileHelper({ dir: TEST_DIR, fileName: "custom.json", atomicSave: false, prettify: false, numSpaces: 2 });
			const expectedPath = path.join(TEST_DIR, "custom.json");
			expect(helper.getJsonFilePath()).toBe(expectedPath);
		});
	});

	describe("Data Loading (Async & Sync)", () => {
		it("loadKeyValues: should create and load an empty object if file does not exist", async () => {
			const helper = new JsonFileHelper({ dir: TEST_DIR, fileName: "new.json", atomicSave: false, prettify: false, numSpaces: 2 });
			const data = await helper.loadKeyValues();
			expect(data).toEqual({});
			// Verifica se o arquivo foi criado
			const fileContent = await fs.promises.readFile(helper.getJsonFilePath(), "utf-8");
			expect(fileContent).toBe("{}");
		});

		it("loadKeyValuesSync: should create and load an empty object if file does not exist", () => {
			const helper = new JsonFileHelper({ dir: TEST_DIR, fileName: "new-sync.json", atomicSave: false, prettify: false, numSpaces: 2 });
			const data = helper.loadKeyValuesSync();
			expect(data).toEqual({});
			// Verifica se o arquivo foi criado
			const fileContent = fs.readFileSync(helper.getJsonFilePath(), "utf-8");
			expect(fileContent).toBe("{}");
		});

		it("should load data correctly from an existing file", async () => {
			const testData = { user: "test", active: true };
			const helper = new JsonFileHelper({ dir: TEST_DIR, fileName: "existing.json", atomicSave: false, prettify: false, numSpaces: 2 });
			await fs.promises.writeFile(helper.getJsonFilePath(), JSON.stringify(testData));

			const asyncData = await helper.loadKeyValues();
			expect(asyncData).toEqual(testData);

			const syncData = helper.loadKeyValuesSync();
			expect(syncData).toEqual(testData);
		});

		it("should throw an error when loading a malformed JSON file", async () => {
			const helper = new JsonFileHelper({ dir: TEST_DIR, fileName: "malformed.json", atomicSave: false, prettify: false, numSpaces: 2 });
			await fs.promises.writeFile(helper.getJsonFilePath(), "{ 'key': 'value', }"); // JSON inválido

			await expect(helper.loadKeyValues()).rejects.toThrow();
			expect(() => helper.loadKeyValuesSync()).toThrow();
		});

		it("loadKeyValues: should load an empty object if file exists but is empty", async () => {
			const helper = new JsonFileHelper({ dir: TEST_DIR, fileName: "empty-async.json", atomicSave: false, prettify: false, numSpaces: 2 });
			const filePath = helper.getJsonFilePath();
			await fs.promises.writeFile(filePath, ""); // Cria um arquivo vazio

			const data = await helper.loadKeyValues();
			expect(data).toEqual({});
		});

		it("loadKeyValuesSync: should load an empty object if file exists but is empty", () => {
			const helper = new JsonFileHelper({ dir: TEST_DIR, fileName: "empty-sync.json", atomicSave: false, prettify: false, numSpaces: 2 });
			const filePath = helper.getJsonFilePath();
			fs.writeFileSync(filePath, ""); // Cria um arquivo vazio sincronicamente

			const data = helper.loadKeyValuesSync();
			expect(data).toEqual({});
		});
	});

	describe("Data Saving (Async & Sync)", () => {
		it("saveKeyValues: should create directory and save data", async () => {
			const helper = new JsonFileHelper({ dir: TEST_DIR, fileName: "save-test.json", atomicSave: false, prettify: false, numSpaces: 2 });
			const testData = { id: 1, value: "async" };

			await helper.saveKeyValues(testData);

			const fileContent = await fs.promises.readFile(helper.getJsonFilePath(), "utf-8");
			expect(JSON.parse(fileContent)).toEqual(testData);
		});

		it("saveKeyValuesSync: should create directory and save data", () => {
			const helper = new JsonFileHelper({ dir: TEST_DIR, fileName: "save-sync-test.json", atomicSave: false, prettify: false, numSpaces: 2 });
			const testData = { id: 2, value: "sync" };

			helper.saveKeyValuesSync(testData);

			const fileContent = fs.readFileSync(helper.getJsonFilePath(), "utf-8");
			expect(JSON.parse(fileContent)).toEqual(testData);
		});

		it("should save with prettify option correctly", async () => {
			const helper = new JsonFileHelper({ dir: TEST_DIR, fileName: "pretty.json", atomicSave: false, prettify: true, numSpaces: 4 });
			const testData = { a: 1, b: 2 };

			await helper.saveKeyValues(testData);

			const fileContent = await fs.promises.readFile(helper.getJsonFilePath(), "utf-8");
			expect(fileContent).toBe(JSON.stringify(testData, null, 4));
		});
	});

	describe("Atomic Saving Logic", () => {
		it("should use writeFileAtomic when atomicSave is true (async)", async () => {
			const helper = new JsonFileHelper({ dir: TEST_DIR, fileName: "atomic.json", atomicSave: true, prettify: false, numSpaces: 2 });
			await helper.saveKeyValues({ atomic: true });

			expect(mockedWriteFileAtomic).toHaveBeenCalled();
			// Verificamos que o fs.promises.writeFile não foi chamado
			const fsSpy = vi.spyOn(fs, "writeFile");
			expect(fsSpy).not.toHaveBeenCalled();
		});

		it("should use fs.promises.writeFile when atomicSave is false (async)", async () => {
			const helper = new JsonFileHelper({ dir: TEST_DIR, fileName: "not-atomic.json", atomicSave: false, prettify: false, numSpaces: 2 });
			const fsSpy = vi.spyOn(fs.promises, "writeFile");

			await helper.saveKeyValues({ atomic: false });

			expect(fsSpy).toHaveBeenCalled();
			expect(mockedWriteFileAtomic).not.toHaveBeenCalled();
		});

		it("should use writeFileAtomic.sync when atomicSave is true (sync)", () => {
			const helper = new JsonFileHelper({ dir: TEST_DIR, fileName: "atomic-sync.json", atomicSave: true, prettify: false, numSpaces: 2 });
			const fsWriteFileSyncSpy = vi.spyOn(fs, "writeFileSync"); // Espia antes da chamada

			helper.saveKeyValuesSync({ atomic: true });

			expect(mockedWriteFileAtomic.sync).toHaveBeenCalledOnce(); // Espera que seja chamado
			expect(fsWriteFileSyncSpy).not.toHaveBeenCalled(); // Espera que fs.promises.writeFileSync NÃO seja chamado
		});

		it("should use fs.promises.writeFileSync when atomicSave is false (sync)", () => {
			const helper = new JsonFileHelper({ dir: TEST_DIR, fileName: "not-atomic-sync.json", atomicSave: false, prettify: false, numSpaces: 2 });
			const fsWriteFileSyncSpy = vi.spyOn(fs, "writeFileSync"); // Espia antes da chamada

			helper.saveKeyValuesSync({ atomic: false });

			expect(fsWriteFileSyncSpy).toHaveBeenCalledOnce();
			expect(mockedWriteFileAtomic.sync).not.toHaveBeenCalled();
		});
	});

	describe("Error Handling", () => {
		it("(Async/Sync) for ensureJsonFile and ensureJsonDir: should throw if fs.promises.statSync fails with an error other than ENOENT", async () => {
			const MSG_ERROR = "Permission denied";
			const helper = new JsonFileHelper({ dir: TEST_DIR, fileName: "sync-error.json", atomicSave: false, prettify: false, numSpaces: 2 });
			const customError = new Error(MSG_ERROR);
			(customError as any).code = "EACCES";

			vi.spyOn(fs, "statSync").mockImplementation(() => {
				throw customError;
			});
			expect(() => helper.loadKeyValuesSync()).toThrow(MSG_ERROR);
			expect(() => helper.saveKeyValuesSync({})).toThrow(MSG_ERROR);

			vi.spyOn(fs.promises, "stat").mockRejectedValue(customError);
			await expect(helper.loadKeyValues()).rejects.toThrow(MSG_ERROR);
			await expect(helper.saveKeyValues({})).rejects.toThrow(MSG_ERROR);
		});

		it("(Async/Sync) ensureJsonDir: should throw if fs.promises.statSync fails with ENOENT", async () => {
			const helper = new JsonFileHelper({ dir: TEST_DIR, fileName: "sync-error.json", atomicSave: false, prettify: false, numSpaces: 2 });
			const customError = new Error();
			(customError as any).code = "ENOENT";

			vi.spyOn(fs, "statSync").mockImplementation(() => {
				throw customError;
			});
			expect(helper.saveKeyValuesSync({})).toBeUndefined();

			vi.spyOn(fs.promises, "stat").mockRejectedValue(customError);
			expect(await helper.saveKeyValues({})).toBeUndefined();
		});
	});
});
