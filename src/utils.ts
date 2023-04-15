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
    /**c:\Users\helio\AppData\Local\Programs\Microsoft VS Code\resources\app\out\vs\code\electron-sandbox\workbench\workbench.html
     * Returns the Electron app. The app may need be accessed
     * via `Remote` depending on whether this code is running
     * in the main or renderer process.
     *
     * @returns The Electron app.
     * @internal
     */
    private getElectronApp(): Electron.App {
        return app;
    }

    /**
     * Returns the path to the settings directory. The path
     * may be customized by the developer by using
     * `configure()`.
     *
     * @returns The path to the settings directory.
     * @internal
     */
    private getSettingsDirPath(): string {
        return this.options.dir ?? this.getElectronApp().getPath('userData');
    }

    /**
     * Returns the path to the settings file. The file name
     * may be customized by the developer using `configure()`.
     *
     * @returns The path to the settings file.
     * @internal
     */
    public getSettingsFilePath(): string {
        const dir = this.getSettingsDirPath();

        return join(dir, this.options.fileName);
    }

    /**
     * Ensures that the settings file exists. If it does not
     * exist, then it is created.
     *
     * @returns A promise which resolves when the settings file exists.
     * @internal
     */
    private ensureSettingsFile(): Promise<void> {
        const filePath = this.getSettingsFilePath();

        return new Promise((resolve, reject) => {
            fs.stat(filePath, (err) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        this.saveSettings({}).then(resolve, reject);
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
     * Ensures that the settings file exists. If it does not
     * exist, then it is created.
     *
     * @internal
     */
    private ensureSettingsFileSync(): void {
        const filePath = this.getSettingsFilePath();

        try {
            fs.statSync(filePath);
        } catch (err: any) {
            if (err) {
                if (err.code === 'ENOENT') {
                    this.saveSettingsSync({});
                } else {
                    throw err;
                }
            }
        }
    }

    /**
     * Ensures that the settings directory exists. If it does
     * not exist, then it is created.
     *
     * @returns A promise which resolves when the settings dir exists.
     * @internal
     */
    private ensureSettingsDir(): Promise<void> {
        const dirPath = this.getSettingsDirPath();

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
     * Ensures that the settings directory exists. If it does
     * not exist, then it is created.
     *
     * @internal
     */
    private ensureSettingsDirSync(): void {
        const dirPath = this.getSettingsDirPath();

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
     * First ensures that the settings file exists then loads
     * the settings from the disk.
     *
     * @returns A promise which resolves with the settings object.
     * @internal
     */
    public loadSettings(): Promise<SettingsObject> {
        return this.ensureSettingsFile().then(() => {
            const filePath = this.getSettingsFilePath();

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
     * First ensures that the settings file exists then loads
     * the settings from the disk.
     *
     * @returns The settings object.
     * @internal
     */
    public loadSettingsSync(): SettingsObject {
        const filePath = this.getSettingsFilePath();

        this.ensureSettingsFileSync();

        const data = fs.readFileSync(filePath, 'utf-8');

        return JSON.parse(data);
    }
    /**
     * Saves the settings to the disk.
     *
     * @param obj The settings object to save.
     * @returns A promise which resolves when the settings have been saved.
     * @internal
     */
    public saveSettings(obj: SettingsObject): Promise<void> {
        return this.ensureSettingsDir().then(() => {
            const filePath = this.getSettingsFilePath();
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
     * Saves the settings to the disk.
     *
     * @param obj The settings object to save.
     * @internal
     */
    public saveSettingsSync(obj: SettingsObject): void {
        const filePath = this.getSettingsFilePath();
        const numSpaces = this.options.prettify ? this.options.numSpaces : 0;
        const data = JSON.stringify(obj, null, numSpaces);

        this.ensureSettingsDirSync();

        if (this.options.atomicSave) {
            writeFileAtomic.sync(filePath, data);
        } else {
            fs.writeFileSync(filePath, data);
        }
    }

}

// export {
//     setConfig,
//     loadSettings, loadSettingsSync,
//     getSettingsFilePath,
//     saveSettings, saveSettingsSync,
// }