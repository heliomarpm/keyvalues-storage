/**
 * This module provides a helper class for managing JSON files in a key-value store.
 * It includes methods for loading, saving, and ensuring the existence of JSON files and directories.
 * It is designed to work with a customizable directory and file name for storing key-value pairs.
 *
 * @module JsonFileHelper
 * @author Heliomar Marques
 * @ignore
 */

import fs from "node:fs";
import path from "node:path";
import writeFileAtomic from "write-file-atomic";

import type { Options, ValueType } from "@/types";

export const DEFAULT_DIR_NAME = "localdb";
export const DEFAULT_FILE_NAME = "keyvalues.json";

export class JsonFileHelper {
	/**
	 * The options for the JsonFileHelper.
	 * @type {@link Options}
	 * @private
	 */
	options: Options;

	/**
	 * Creates an instance of JsonFileHelper.
	 *
	 * @param {@link Options} options - The options for the JsonFileHelper.
	 * @constructor
	 */
	constructor(options: Options) {
		this.options = options;
	}

	/**
	 * Returns the path to the keyvalues directory. The path
	 * may be customized by the developer by using
	 * `configure()`.
	 *
	 * @returns The path to the keyvalues directory.
	 * @internal
	 */
	private getJsonDirPath(): string {
		const dir = (this.options.dir ?? path.resolve(DEFAULT_DIR_NAME)).trim();
		return dir === "" ? "./" : dir;
	}

	/**
	 * Returns the path to the keyvalues file. The file name
	 * may be customized by the developer using `configure()`.
	 *
	 * @returns The path to the keyvalues file.
	 * @internal
	 */
	public getJsonFilePath(): string {
		const dir = this.getJsonDirPath();
		let fileName = this.options.fileName.trim();
		fileName = fileName === "" ? DEFAULT_FILE_NAME : fileName;

		return path.join(dir, fileName);
	}

	/**
	 * Ensures that the keyvalues file exists. If it does not
	 * exist, then it is created.
	 *
	 * @returns A promise which resolves when the keyvalues file exists.
	 * @internal
	 */
	private async ensureJsonFile(): Promise<void> {
		const filePath = this.getJsonFilePath();

		try {
			await fs.promises.stat(filePath);
		} catch (error) {
			const ex = error as NodeJS.ErrnoException;
			if (ex?.code === "ENOENT") {
				await this.saveKeyValues({});
			} else {
				throw error;
			}
		}
	}

	/**
	 * Ensures that the keyvalues file exists. If it does not
	 * exist, then it is created.
	 *
	 * @internal
	 */
	private ensureJsonFileSync(): void {
		const filePath = this.getJsonFilePath();

		try {
			fs.statSync(filePath);
		} catch (error) {
			const ex = error as NodeJS.ErrnoException;
			if (ex?.code === "ENOENT") {
				this.saveKeyValuesSync({});
			} else {
				throw error;
			}
		}
	}

	/**
	 * Ensures that the KeyValues directory exists. If it does
	 * not exist, then it is created.
	 *
	 * @returns A promise which resolves when the keyvalues dir exists.
	 * @internal
	 */
	private async ensureJsonDir(): Promise<void> {
		const dirPath = this.getJsonDirPath();

		try {
			await fs.promises.stat(dirPath);
		} catch (error) {
			const ex = error as NodeJS.ErrnoException;
			if (ex?.code === "ENOENT") {
				await fs.promises.mkdir(dirPath, { recursive: true });
			} else {
				throw error;
			}
		}
	}

	/**
	 * Ensures that the KeyValues directory exists synchronously. If it does not exist,
	 * then it is created.
	 *
	 * @returns {void}
	 * @internal
	 */
	private ensureJsonDirSync(): void {
		const dirPath = this.getJsonDirPath();

		try {
			fs.statSync(dirPath);
		} catch (error) {
			const ex = error as NodeJS.ErrnoException;
			if (ex?.code === "ENOENT") {
				fs.mkdirSync(dirPath, { recursive: true });
			} else {
				throw error;
			}
		}
	}

	/**
	 * Asynchronously loads key-value pairs from a JSON file. First ensures that the file exists,
	 * then reads the file and parses its contents into a JavaScript object.
	 *
	 * @template T - The type of the key-value pairs.
	 * @return {Promise<T>} A promise that resolves with the key-value pairs.
	 * @internal
	 */
	public async loadKeyValues<T extends ValueType>(): Promise<T> {
		await this.ensureJsonFile();

		const filePath = this.getJsonFilePath();
		const data = await fs.promises.readFile(filePath, "utf-8");
		// fs.promises.readFile com 'utf-8' sempre retorna uma string, então a verificação de array é desnecessária.
		const jsonData = data || "{}";

		return JSON.parse(jsonData) as T;
	}

	/**
	 * Loads the key-value pairs synchronously from the JSON file.
	 *
	 * @template T - The type of the key-value pairs.
	 * @returns {T} - The loaded key-value pairs.
	 * @internal
	 */
	public loadKeyValuesSync<T extends ValueType>(): T {
		this.ensureJsonFileSync();
		const filePath = this.getJsonFilePath();
		const data = fs.readFileSync(filePath, "utf-8");

		return JSON.parse(data.length ? data : "{}") as T;
	}

	/**
	 * Saves the keyvalues to the disk.
	 *
	 * @param {T} obj - The keyvalues object to save.
	 * @return {Promise<void>} A promise that resolves when the keyvalues have been saved.
	 * @internal
	 */
	public async saveKeyValues<T>(obj: T): Promise<void> {
		const filePath = this.getJsonFilePath();
		const numSpaces = this.options.prettify ? this.options.numSpaces : 0;
		const content = JSON.stringify(obj, null, numSpaces);

		await this.ensureJsonDir();
		if (this.options.atomicSave) {
			await writeFileAtomic(filePath, content);
		} else {
			await fs.promises.writeFile(filePath, content);
		}
	}

	/**
	 * Saves the keyvalues to the disk synchronously.
	 *
	 * @param {T} obj - The keyvalues object to save.
	 * @return {void} This function does not return anything.
	 * @internal
	 */
	public saveKeyValuesSync<T>(obj: T): void {
		const filePath = this.getJsonFilePath();
		const numSpaces = this.options.prettify ? this.options.numSpaces : 0;
		const data = JSON.stringify(obj, null, numSpaces);

		this.ensureJsonDirSync();

		if (this.options.atomicSave) {
			writeFileAtomic.sync(filePath, data);
		} else {
			fs.writeFileSync(filePath, data);
		}
	}
}
