import { get as _get, set as _set, has as _has, unset as _unset } from 'lodash';

import './internal/types';
import { DEFAULT_DIR_NAME, DEFAULT_FILE_NAME, JsonFileHelper } from './internal/JsonFileHelper';

/** @internal */
const defaultOptions: Options = {
	atomicSave: true,
	dir: DEFAULT_DIR_NAME,
	fileName: DEFAULT_FILE_NAME,
	prettify: false,
	numSpaces: 2
};

/**
 * The `KeyValues` class is responsible for managing key-value pairs and storing them in a JSON file.
 * It provides methods for setting, getting, checking existence, and removing key-value pairs.
 * The class uses the `Functions` class to handle file operations and data manipulation.
 *
 * @example
 * // Create a new instance of KeyValues with custom options
 * const keyValues = new KeyValues({
 *   fileName: 'config.json',
 *   prettify: true
 * });
 *
 * // Set a key-value pair
 * await keyValues.set('color.name', 'sapphire');
 *
 * // Get the value at a specific key path
 * const value = await keyValues.get('color.name');
 *
 * // Check if a key path exists
 * const exists = await keyValues.has('color.name');
 *
 * // Remove a key-value pair
 * await keyValues.unset('color.name');
 */
export class KeyValues {
	/**
	 * @internal
	 */
	private options: Options = {
		...defaultOptions
	};

	/**
	 * @internal
	 */
	private jsonHelper: JsonFileHelper;

	/**
	 * Sets the configuration for KeyValues Storage's. To reset
	 * to defaults, use [[reset|reset()]].
	 *```js
	 * Defaults:
	 *     {
	 *       atomicSave: true,
	 *       fileName: 'keyvalues.json',
	 *       numSpaces: 2,
	 *       prettify: false
	 *     }
	 *```
	 * @param options The custom configuration to use.
	 * @example
	 *
	 * Update the filename to `config.json` and prettify
	 * the output.
	 *```js
	 *     new KeyValues({
	 *       fileName: 'config.json',
	 *       prettify: true
	 *     });
	 * ```
	 */
	constructor(options?: Partial<Options>) {
		if (options) this.options = { ...this.options, ...options };

		this.jsonHelper = new JsonFileHelper(this.options);
	}

	/**
	 * Returns the path to the json file.
	 *
	 * In general, the json file is stored
	 * in then install location of your app's
	 * user data directory in a file called `keyvalues.json`.
	 * The default user data directory varies by system.
	 *
	 * - **macOS** - `~/Library/Application\ Support/<Your App>`
	 * - **Windows** - `%LOCALAPPDATA%/PROGRAMS/<Your App>`
	 * - **Linux** - Either `$XDG_CONFIG_HOME/<Your App>` or
	 * `~/.config/<Your App>`
	 *
	 * Although it is not recommended, you may change the name
	 * or location of the keyvalues file using
	 *
	 * new KeyValye({dir: 'newpath'})
	 *
	 * @returns The path to the keyvalues file.
	 * @example
	 *
	 * Get the path to the keyvalues file.
	 *```js
	 *     keyValues.file();
	 *     // => c:/users/<userprofile>/appdata/local/programs/<AppName>/keyvalues.json
	 * ```
	 */
	file(): string {
		return this.jsonHelper.getJsonFilePath();
	}

	/**
	 * Resets the KeyValues Storage's configuration to defaults.
	 *
	 * @example
	 *
	 * Reset configuration to defaults.
	 *```js
	 *     keyValues.reset();
	 * ```
	 */
	reset(): void {
		this.options = { ...defaultOptions };
	}

	/**
	 * Checks if the given key path exists. For sync,
	 * use [[hasSync|hasSync()]].
	 *
	 * @category Core
	 * @param keyPath The key path to check.
	 * @returns A promise which resolves to `true` if the
	 * `keyPath` exists, else `false`.
	 * @example
	 *
	 * Check if the value at `color.name` exists.
	 *```js
	 *     // Given:
	 *     //
	 *     // {
	 *     //   "color": {
	 *     //     "name": "cerulean",
	 *     //     "code": {
	 *     //       "rgb": [0, 179, 230],
	 *     //       "hex": "#003BE6"
	 *     //     }
	 *     //   }
	 *     // }
	 *
	 *     const exists = await keyValues.has('color.name');
	 *     // => true
	 *```
	 * @example
	 *
	 * Check if the value at `color.hue` exists.
	 *```js
	 *     const h = 'hue';
	 *     const exists = await keyValues.has(['color', h]);
	 *     // => false
	 *```
	 *  @example
	 *
	 * Check if the value at `color.code.rgb[1]` exists.
	 *```js
	 *     const exists = await keyValues.has(color.code.rgb[1]);
	 *     // => true
	 * ```
	 */
	async has(keyPath: KeyPath): Promise<boolean> {
		const obj = await this.jsonHelper.loadKeyValues();

		return _has(obj, keyPath);
	}

	/**
	 * Checks if the given key path exists. For async,
	 * use [[hasSync|hasSync()]].
	 *
	 * @category Core
	 * @param keyPath The key path to check.
	 * @returns `true` if the `keyPath` exists, else `false`.
	 * @example
	 *
	 * Check if the value at `color.name` exists.
	 *```js
	 *     // Given:
	 *     //
	 *     // {
	 *     //   "color": {
	 *     //     "name": "cerulean",
	 *     //     "code": {
	 *     //       "rgb": [0, 179, 230],
	 *     //       "hex": "#003BE6"
	 *     //     }
	 *     //   }
	 *     // }
	 *
	 *     const exists = keyValues.hasSync('color.name');
	 *     // => true
	 *```
	 * @example
	 *
	 * Check if the value at `color.hue` exists.
	 *```js
	 *     const h = 'hue';
	 *     const exists = keyValues.hasSync(['color', h]);
	 *     // => false
	 *```
	 * @example
	 *
	 * Check if the value at `color.code.rgb[1]` exists.
	 *```js
	 *     const exists = keyValues.hasSync(color.code.rgb[1]);
	 *     // => true
	 * ```
	 */
	hasSync(keyPath: KeyPath): boolean {
		const obj = this.jsonHelper.loadKeyValuesSync();

		return _has(obj, keyPath);
	}

	/**
	 * Gets all key values. For sync, use
	 * [[getSync|getSync()]].
	 *
	 * @category Core
	 * @returns A promise which resolves with all key values.
	 * @example
	 *
	 * Gets all key values.
	 *```js
	 *     const obj = await get();
	 * ```
	 */
	async get<T extends valueTypes>(): Promise<T>;

	/**
	 * Gets the value at the given key path. For sync,
	 * use [[getSync|getSync()]].
	 *
	 * @category Core
	 * @param keyPath The key path of the property.
	 * @returns A promise which resolves with the value at the
	 * given key path.
	 * @example
	 *
	 * Get the value at `color.name`.
	 *```js
	 *     // Given:
	 *     {
	 *        "color": {
	 *          "name": "cerulean",
	 *          "code": {
	 *            "rgb": [0, 179, 230],
	 *            "hex": "#003BE6"
	 *          }
	 *        }
	 *     }
	 *
	 *     const value = await keyValues.get('color.name');
	 *     // => "cerulean"
	 *```
	 * @example
	 *
	 * Get the value at `color.code.hex`.
	 *```js
	 *     const hex = await keyValues.get('color.color.hex');
	 *     // => "#003BE6"
	 *```
	 * @example
	 *
	 * Get the value at `color.hue`.
	 *```js
	 *     const h = 'hue';
	 *     const value = await keyValues.get(['color', h]);
	 *     // => undefined
	 *```
	 * @example
	 *
	 * Get the value at `color.code.rgb[1]`.
	 *```js
	 *     const h = 'hue';
	 *     const value = await keyValues.get('color.code.rgb[1]');
	 *     // => 179
	 * ```
	 */
	async get<T extends valueTypes>(keyPath: KeyPath): Promise<T>;

	async get<T extends valueTypes>(keyPath?: KeyPath): Promise<T> {
		try {
			const obj = await this.jsonHelper.loadKeyValues<T>();
			if (keyPath) {
				return _get(obj, keyPath);
			}
			return obj;
		} catch (error) {
			// Add proper error handling
			if (error instanceof Error) {
				throw new Error(`Failed to get value: ${error.message}`);
			} else {
				throw new Error('Failed to get value: Unknown error');
			}
		}
	}

	/**
	 * Gets all key values. For async, use [[get|get()]].
	 *
	 * @category Core
	 * @returns All key values.
	 * @example
	 *
	 * Gets all key values.
	 *```js
	 *     const obj = getSync();
	 * ```
	 */
	getSync<T extends valueTypes>(): T;

	/**
	 * Gets the value at the given key path. For async,
	 * use [[get|get()]].
	 *
	 * @category Core
	 * @param keyPath The key path of the property.
	 * @returns The value at the given key path.
	 * @example
	 *
	 * Get the value at `color.name`.
	 *```js
	 *     // Given:
	 *     {
	 *        "color": {
	 *          "name": "cerulean",
	 *          "code": {
	 *            "rgb": [0, 179, 230],
	 *            "hex": "#003BE6"
	 *          }
	 *        }
	 *     }
	 *
	 *     const value = await keyValues.get('color.name');
	 *     // => "cerulean"
	 *```
	 * @example
	 *
	 * Get the value at `color.code.hex`.
	 *```js
	 *     const hex = await keyValues.get('color.color.hex');
	 *     // => "#003BE6"
	 *```
	 * @example
	 *
	 * Get the value at `color.hue`.
	 *```js
	 *     const h = 'hue';
	 *     const value = await keyValues.get(['color', h]);
	 *     // => undefined
	 *```
	 * @example
	 *
	 * Get the value at `color.code.rgb[1]`.
	 *```js
	 *     const h = 'hue';
	 *     const value = await keyValues.get('color.code.rgb[1]');
	 *     // => 179
	 * ```
	 */
	getSync<T extends valueTypes>(keyPath: KeyPath): T;

	getSync<T extends valueTypes>(keyPath?: KeyPath): T {
		const obj = this.jsonHelper.loadKeyValuesSync<T>();

		if (keyPath) {
			return _get(obj, keyPath);
		} else {
			return obj;
		}
	}

	/**
	 * Sets all key values. For sync, use [[setSync|setSync()]].
	 *
	 * @category Core
	 * @param obj The new key value.
	 * @returns A promise which resolves when the value have
	 * been set.
	 * @example
	 *
	 * Set all key values.
	 *```js
	 *     await keyValues.set({ aqpw: 'nice' });
	 * ```
	 */
	async set<T extends valueTypes>(obj: Types<T>): Promise<void>;

	/**
	 * Sets the value at the given key path. For sync,
	 * use [[setSync|setSync()]].
	 *
	 * @category Core
	 * @param keyPath The key path of the property.
	 * @param value The value to set.
	 * @returns A promise which resolves when the setting has
	 * been set.
	 * @example
	 *
	 * Change the value at `color.name` to `sapphire`.
	 *```js
	 *     // Given:
	 *     //
	 *     // {
	 *     //   "color": {
	 *     //     "name": "cerulean",
	 *     //     "code": {
	 *     //       "rgb": [0, 179, 230],
	 *     //       "hex": "#003BE6"
	 *     //     }
	 *     //   }
	 *     // }
	 *
	 *     await keyValues.set('color.name', 'sapphire');
	 *```
	 * @example
	 *
	 * Set the value of `color.hue` to `blue-ish`.
	 *```js
	 *     const h = 'hue';
	 *     await keyValues.set(['color', h], 'blue-ish);
	 *```
	 * @example
	 *
	 * Change the value of `color.code`.
	 *```js
	 *     await keyValues.set('color.code', {
	 *       rgb: [16, 31, 134],
	 *       hex: '#101F86'
	 *     });
	 * ```
	 */
	async set<T extends valueTypes>(keyPath: KeyPath, value: T): Promise<void>;

	async set<T extends valueTypes>(...args: [Types<T>] | [KeyPath, T]): Promise<void> {
		if (args.length === 1) {
			const [value] = args;

			return this.jsonHelper.saveKeyValues(value);
		} else {
			const [keyPath, value] = args;
			const obj = await this.jsonHelper.loadKeyValues<T>();

			_set(obj as object, keyPath, value);

			return this.jsonHelper.saveKeyValues(obj);
		}
	}

	/**
	 * Sets all key values. For async, use [[set|set()]].
	 *
	 * @category Core
	 * @param obj The new key values.
	 * @example
	 *
	 * Set all key values.
	 *```js
	 *     keyValues.setSync({ aqpw: 'nice' });
	 * ```
	 */
	setSync<T extends valueTypes>(obj: Types<T>): void;

	/**
	 * Sets the value at the given key path. For async,
	 * use [[set|set()]].
	 *
	 * @category Core
	 * @param keyPath The key path of the property.
	 * @param value The value to set.
	 * @example
	 *
	 * Change the value at `color.name` to `sapphire`.
	 *```js
	 *     // Given:
	 *     //
	 *     // {
	 *     //   "color": {
	 *     //     "name": "cerulean",
	 *     //     "code": {
	 *     //       "rgb": [0, 179, 230],
	 *     //       "hex": "#003BE6"
	 *     //     }
	 *     //   }
	 *     // }
	 *
	 *     keyValues.setSync('color.name', 'sapphire');
	 *```
	 * @example
	 *
	 * Set the value of `color.hue` to `blue-ish`.
	 *```js
	 *     const h = 'hue';
	 *     keyValues.setSync(['color', h], 'blue-ish);
	 *```
	 * @example
	 *
	 * Change the value of `color.code`.
	 *```js
	 *     keyValues.setSync('color.code', {
	 *       rgb: [16, 31, 134],
	 *       hex: '#101F86'
	 *     });
	 * ```
	 */
	setSync<T extends valueTypes>(keyPath: KeyPath, value: T): void;

	setSync<T extends valueTypes>(...args: [Types<T>] | [KeyPath, T]): void {
		// console.log(args);
		if (args.length === 1) {
			const [value] = args;

			this.jsonHelper.saveKeyValuesSync(value);
		} else {
			const [keyPath, value] = args;
			const obj = this.jsonHelper.loadKeyValuesSync<T>();

			_set(obj as object, keyPath, value);

			this.jsonHelper.saveKeyValuesSync(obj);
		}
	}

	/**
	 * Unsets all key values. For sync, use [unsetSync()].
	 *
	 * @category Core
	 * @returns A promise which resolves when the key values have
	 * been unset.
	 * @example
	 *
	 * Unsets all key values.
	 *```js
	 *     await keyValues.unset();
	 * ```
	 */
	async unset(): Promise<boolean>;

	/**
	 * Unsets the property at the given key path. For sync,
	 * use [[unsetSync|unsetSync()]].
	 *
	 * @category Core
	 * @param keyPath The key path of the property.
	 * @returns A promise which resolves when the setting has
	 * been unset.
	 * @example
	 *
	 * Unset the property `color.name`.
	 *```js
	 *     // Given:
	 *     //
	 *     // {
	 *     //   "color": {
	 *     //     "name": "cerulean",
	 *     //     "code": {
	 *     //       "rgb": [0, 179, 230],
	 *     //       "hex": "#003BE6"
	 *     //     }
	 *     //   }
	 *     // }
	 *
	 *     await keyValues.unset('color.name');
	 *
	 *     await keyValues.get('color.name');
	 *     // => undefined
	 *```
	 * @example
	 *
	 * Unset the property `color.code.rgba[1]`.
	 *```js
	 *     await keyValues.unset('color.code.rgba[1]');
	 *
	 *     await keyValues.get('color.code.rgb');
	 *     // => [0, null, 230]
	 * ```
	 */
	async unset(keyPath: KeyPath): Promise<boolean>;

	async unset(keyPath?: KeyPath): Promise<boolean> {
		const obj = await this.jsonHelper.loadKeyValues();

		if (keyPath) {
			if (_unset(obj, keyPath)) {
				return this.jsonHelper.saveKeyValues(obj).then(() => true);
			}
		} else {
			// Unset all keyValues by saving empty object.
			if (JSON.stringify(obj) !== '{}') {
				return this.jsonHelper.saveKeyValues({}).then(() => true);
			}
		}

		return false;
	}

	/**
	 * Unsets all key values. For async, use [unset()].
	 *
	 * @category Core
	 * @example
	 *
	 * Unsets all key values.
	 *```js
	 *     keyValues.unsetSync();
	 * ```
	 */
	unsetSync(): boolean;

	/**
	 * Unsets the property at the given key path. For async,
	 * use [[unset|unset()]].
	 *
	 * @category Core
	 * @param keyPath The key path of the property.
	 * @example
	 *
	 * Unset the property `color.name`.
	 *```js
	 *     // Given:
	 *     //
	 *     // {
	 *     //   "color": {
	 *     //     "name": "cerulean",
	 *     //     "code": {
	 *     //       "rgb": [0, 179, 230],
	 *     //       "hex": "#003BE6"
	 *     //     }
	 *     //   }
	 *     // }
	 *
	 *     keyValues.unsetSync('color.name');
	 *
	 *     keyValues.getSync('color.name');
	 *     // => undefined
	 *```
	 * @example
	 *
	 * Unset the property `color.code.rgba[1]`.
	 *```js
	 *     keyValues.unsetSync('color.code.rgba[1]');
	 *
	 *     keyValues.getSync('color.code.rgb');
	 *     // => [0, null, 230]
	 * ```
	 */
	unsetSync(keyPath: KeyPath): boolean;

	unsetSync(keyPath?: KeyPath): boolean {
		const obj = this.jsonHelper.loadKeyValuesSync();
		if (keyPath) {
			if (_unset(obj, keyPath)) {
				this.jsonHelper.saveKeyValuesSync(obj);
				return true;
			}
		} else {
			// Unset all keyValues by saving empty object.
			if (JSON.stringify(obj) !== '{}') {
				this.jsonHelper.saveKeyValuesSync({});
				return true;
			}
		}

		return false;
	}
}
