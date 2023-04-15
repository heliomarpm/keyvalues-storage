import electron from 'electron';
import { app } from '@electron/remote';
import { join } from 'node:path';
import fs from 'node:fs';
import writeFileAtomic from 'write-file-atomic';
import { mkdirp } from 'mkdirp'

import './types';

export class Utils {

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
        return this.options.dir ?? app.getPath('userData');
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

        return join(dir, this.options.fileName);
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
                    if (err.code === 'ENOENT') {
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
        } catch (err: any) {
            if (err) {
                if (err.code === 'ENOENT') {
                    this.saveKeyValuesSync({});
                } else {
                    throw err;
                }
            }
        }
    }

    /**
     * Ensures that the keyvalues directory exists. If it does
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
                    if (err.code === 'ENOENT') {
                        mkdirp(dirPath).then(() => resolve(), reject);
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
     * Ensures that the keyvalues directory exists. If it does
     * not exist, then it is created.
     *
     * @internal
     */
    private ensureJsonDirSync(): void {
        const dirPath = this.getJsonDirPath();

        try {
            fs.statSync(dirPath);
        } catch (err: any) {
            if (err.code === 'ENOENT') {
                mkdirp.sync(dirPath);
            } else {
                throw err;
            }
        }
    }

    /**
     * First ensures that the keyvalues file exists then loads
     * the keyvalues from the disk.
     *
     * @returns A promise which resolves with the keyvalues object.
     * @internal
     */
    public loadKeyValues(): Promise<ValueObject> {
        return this.ensureJsonFile().then(() => {
            const filePath = this.getJsonFilePath();

            return new Promise((resolve, reject) => {
                fs.readFile(filePath, 'utf-8', (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        try {
                            resolve(JSON.parse(data));
                        } catch (err) {
                            reject(err);
                        }
                    }
                });
            });
        });
    }

    /**
     * First ensures that the keyvalues file exists then loads
     * the keyvalues from the disk.
     *
     * @returns The keyvalues object.
     * @internal
     */
    public loadKeyValuesSync(): ValueObject {
        const filePath = this.getJsonFilePath();

        this.ensureJsonFileSync();

        const data = fs.readFileSync(filePath, 'utf-8');

        return JSON.parse(data);
    }
    /**
     * Saves the keyvalues to the disk.
     *
     * @param obj The keyvalues object to save.
     * @returns A promise which resolves when the keyvalues have been saved.
     * @internal
     */
    public saveKeyValues(obj: ValueObject): Promise<void> {
        return this.ensureJsonDir().then(() => {
            const filePath = this.getJsonFilePath();
            const numSpaces = this.options.prettify ? this.options.numSpaces : 0;
            const data = JSON.stringify(obj, null, numSpaces);

            return new Promise((resolve, reject) => {
                if (this.options.atomicSave) {
                    writeFileAtomic(filePath, data, (err: any) => {
                        return err
                            ? reject(err)
                            : resolve();
                    });
                } else {
                    fs.writeFile(filePath, data, (err) => {
                        return err
                            ? reject(err)
                            : resolve();
                    });
                }
            });
        });
    }

    /**
     * Saves the keyvalues to the disk.
     *
     * @param obj The keyvalues object to save.
     * @internal
     */
    public saveKeyValuesSync(obj: ValueObject): void {
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