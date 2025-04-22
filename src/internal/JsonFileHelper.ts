import fs from "node:fs";
import path from "node:path";
import writeFileAtomic from "write-file-atomic";

import "./types";

export const DEFAULT_DIR_NAME = "localdb";
export const DEFAULT_FILE_NAME = "keyvalues.json";

export class JsonFileHelper {
	options: Options;

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
	private ensureJsonFile(): Promise<void> {
		const filePath = this.getJsonFilePath();

		return new Promise((resolve, reject) => {
			fs.stat(filePath, (err) => {
				if (err) {
					if (err.code === "ENOENT") {
						this.saveKeyValues({}).then(resolve, reject);
					} else {
						reject(err);
					}
				} else {
					resolve();
				}
			});
		});
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
		} catch (ex) {
			const err = ex as NodeJS.ErrnoException;
			if (err.code === "ENOENT") {
				this.saveKeyValuesSync({});
			} else {
				throw err;
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
	private ensureJsonDir(): Promise<void> {
		const dirPath = this.getJsonDirPath();

		return new Promise((resolve, reject) => {
			fs.stat(dirPath, (err) => {
				if (err) {
					if (err.code === "ENOENT") {
						fs.mkdir(dirPath, { recursive: true }, (error: unknown) => {
							if (error) {
								reject(error);
							} else {
								resolve();
							}
						});
						// mkdirp(dirPath).then(() => resolve(), reject);
					} else {
						reject(err);
					}
				} else {
					resolve();
				}
			});
		});
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
		} catch (ex) {
			const err = ex as NodeJS.ErrnoException;

			if (err.code === "ENOENT") {
				fs.mkdirSync(dirPath, { recursive: true });
				// mkdirp.sync(dirPath);
			} else {
				throw err;
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
	public async loadKeyValues<T extends valueTypes>(): Promise<T> {
		await this.ensureJsonFile();
		const filePath = this.getJsonFilePath();

		return new Promise<T>((resolve, reject) => {
			fs.readFile(filePath, "utf-8", (err, data) => {
				if (err) {
					reject(err);
				} else {
					try {
						const jsonData = Array.isArray(data) ? data.join("") : data || "{}";
						resolve(JSON.parse(jsonData));
					} catch (error) {
						reject(error);
					}
				}
			});
		});
	}

	/**
	 * Loads the key-value pairs synchronously from the JSON file.
	 *
	 * @template T - The type of the key-value pairs.
	 * @returns {T} - The loaded key-value pairs.
	 * @internal
	 */
	public loadKeyValuesSync<T extends valueTypes>(): T {
		this.ensureJsonFileSync();
		const filePath = this.getJsonFilePath();
		const data = fs.readFileSync(filePath, "utf-8");

		return JSON.parse(data.length ? data : "{}");
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
		await new Promise<void>((resolve, reject) => {
			if (this.options.atomicSave) {
				writeFileAtomic(filePath, content, (error) => {
					return error ? reject(error) : resolve();
				});
			} else {
				fs.writeFile(filePath, content, (error) => {
					return error ? reject(error) : resolve();
				});
			}
		});
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
