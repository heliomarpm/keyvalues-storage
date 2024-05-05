import path from 'node:path';
import fs from 'node:fs';
import writeFileAtomic from 'write-file-atomic';

import './types';

export const DEFAULT_DIR_NAME = 'localdb';
export const DEFAULT_FILE_NAME = 'keyvalues.json';

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
    let dir = (this.options.dir ?? path.resolve(DEFAULT_DIR_NAME)).trim();
    return dir === '' ? './' : dir;
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
    fileName = fileName === '' ? DEFAULT_FILE_NAME : fileName;

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
      fs.stat(filePath, (err: any) => {
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
      if (err.code === 'ENOENT') {
        this.saveKeyValuesSync({});
      } else {
        throw err;
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
      fs.stat(dirPath, (err: any) => {
        if (err) {
          if (err.code === 'ENOENT') {
            fs.mkdir(dirPath, { recursive: true }, (error: any) => {
              error ? reject(error) : resolve();
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
        fs.mkdirSync(dirPath, { recursive: true });
        // mkdirp.sync(dirPath);
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
  public async loadKeyValues<T extends valueTypes>(): Promise<T> {
    await this.ensureJsonFile();
    const filePath = this.getJsonFilePath();

    return await new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf-8', (err: any, data: string | any[]) => {
        if (err) {
          reject(err);
        } else {
          try {
            // resolve(JSON.parse(data.length ? data : "{}"));
            resolve(JSON.parse(data ? (Array.isArray(data) ? data.join('') : data) : "{}"));
          } catch (err_1) {
            reject(err_1);
          }
        }
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
  public loadKeyValuesSync<T extends valueTypes>(): T {
    this.ensureJsonFileSync();
    const filePath = this.getJsonFilePath();
    const data = fs.readFileSync(filePath, 'utf-8');

    return JSON.parse(data.length ? data : "{}");
  }

  /**
   * Saves the keyvalues to the disk.
   *
   * @param obj The keyvalues object to save.
   * @returns A promise which resolves when the keyvalues have been saved.
   * @internal
   */
  public async saveKeyValues<T>(obj: T): Promise<void> {
    await this.ensureJsonDir();
    const filePath = this.getJsonFilePath();
    const numSpaces = this.options.prettify ? this.options.numSpaces : 0;
    const data = JSON.stringify(obj, null, numSpaces);

    return await new Promise((resolve, reject) => {
      if (this.options.atomicSave) {
        writeFileAtomic(filePath, data, (err: any) => {
          return err
            ? reject(err)
            : resolve();
        });
      } else {
        fs.writeFile(filePath, data, (err_1: any) => {
          return err_1 ? reject(err_1)
            : resolve();
        });
      }
    });
  }

  /**
   * Saves the keyvalues to the disk.
   *
   * @param obj The keyvalues object to save.
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
