import { get as _get, has as _has, set as _set, unset as _unset } from "lodash";

import type { KeyPath, Options, RecordType, ValueType } from "./types";
import { DEFAULT_DIR_NAME, DEFAULT_FILE_NAME, JsonFileHelper } from "./utils";

/** @internal */
const defaultOptions: Options = {
	atomicSave: true,
	dir: DEFAULT_DIR_NAME,
	fileName: DEFAULT_FILE_NAME,
	prettify: false,
	numSpaces: 2,
};

/**
 *
 * KeyValues is a class that provides a simple key-value storage system.
 * It allows you to set, get, check existence, and remove key-value pairs in a JSON file.
 * It supports nested keys and complex data types, and provides both asynchronous and synchronous methods
 *
 * It is designed to be used in Node.js applications
 * and can be easily configured to use a custom directory
 * and file name for storing key-value pairs.
 *
 * @author Heliomar Marques
 * @example
 *
 * import { KeyValues } from '@heliomarpm/kvs';
 *
 * // Create a new instance of KeyValues with custom options
 * const keyValues = new KeyValues({
 * 	fileName: 'config.json',
 * 	prettify: true,
 * 	numSpaces: 4
 * });
 *
 * // Set a key-value pair
 * await keyValues.set('color.name', 'sapphire');
 *
 * // Get the value at a specific key path
 * const value = await keyValues.get('color.name');
 * // output: 'sapphire'
 *
 * // Get the nested key
 * const value = await keyValues.get('color');
 * // output: { name: 'sapphire' }
 *
 * // Get all
 * const value = await keyValues.get();
 * // output: { color: { name: 'sapphire' } }
 *
 * // Check if a key path exists
 * const exists = await keyValues.has('color.name');
 *
 * // Remove a key-value pair
 * await keyValues.unset('color.name');
 *
 * @category Core
 */
export class KeyValues {
	/**
	 * @internal
	 */
	private options: Options = {
		...defaultOptions,
	};

	/**
	 * @internal
	 */
	private jsonHelper: JsonFileHelper;

	/**
	 * Sets the configuration for KeyValues Storage's.
	 *
	 * To reset to defaults, use [`reset()`].
	 *
	 * ```js
	 * Defaults:
	 * {
	 *	atomicSave: true,
	 * 	dir: 'localdb',
	 *	fileName: 'keyvalues.json',
	 * 	numSpaces: 2,
	 * 	prettify: false
	 * }
	 * ```
	 * @param options {@link Options} The custom configuration to use.
	 * @example
	 *
	 * Update the filename to `config.json` and prettify the output.
	 * ```js
	 * new KeyValues({ fileName: 'config.json', prettify: true });
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
	 * - **Linux** - Either `$XDG_CONFIG_HOME/<Your App>` or `~/.config/<Your App>`
	 *
	 * Although it is not recommended, you may change the name
	 * or location of the keyvalues file using
	 *
	 * new KeyValye({dir: 'newpath'})
	 *
	 * @returns The path to the keyvalues file.
	 *
	 * @example
	 *
	 * Get the path to the keyvalues file.
	 * ```js
	 * keyValues.file();
	 * // => c:/users/<userprofile>/appdata/local/programs/<AppName>/keyvalues.json
	 * ```
	 *
	 * @category Auxiliary Methods
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
	 * ```js
	 * keyValues.resetOptions();
	 * ```
	 *
	 * @category Auxiliary Methods
	 * @see {@link Options}
	 */
	resetOptions(): void {
		this.options = { ...defaultOptions };
	}

	/**
	 * Sets all key values.
	 *
	 * _For sync method, use_ [`setSync()`].
	 *
	 * @param obj The new key value.
	 * @returns A promise which resolves when the value have been set.
	 * @example
	 *
	 * Set all key values.
	 * ```js
	 * await keyValues.set({ aqpw: 'nice' });
	 * ```
	 *
	 * @category Set Methods
	 */
	async set<T extends ValueType>(obj: RecordType<T>): Promise<void>;

	/**
	 * Sets the value at the given key path.
	 *
	 * _For sync method, use_ [`setSync()`].
	 *
	 * @param keyPath The key path of the property.
	 * @param value The value to set.
	 * @returns A promise which resolves when the setting has been set.
	 *
	 * @example
	 *
	 * Change the value at `color.name` to `sapphire`.
	 * ```js
	 * // Given:
	 * {
	 * 	"color": {
	 *		"name": "cerulean",
	 *		"code": {
	 *			"rgb": [0, 179, 230],
	 *			"hex": "#003BE6"
	 *		}
	 *	}
	 * }
	 *
	 * await keyValues.set('color.name', 'sapphire');
	 * ```
	 * @example
	 *
	 * Set the value of `color.hue` to `bluish`.
	 * ```js
	 * await keyValues.set(['color', 'hue'], 'bluish');
	 * ```
	 * @example
	 *
	 * Change the value of `color.code`.
	 * ```js
	 * await keyValues.set('color.code', { rgb: [16, 31, 134], hex: '#101F86' });
	 * ```
	 *
	 * @category Set Methods
	 */
	async set<T extends ValueType>(keyPath: KeyPath, value: T): Promise<void>;

	async set<T extends ValueType>(...args: [RecordType<T>] | [KeyPath, T]): Promise<void> {
		if (args.length === 1) {
			const [value] = args;

			return this.jsonHelper.saveKeyValues(value);
		}

		const [keyPath, value] = args;
		const obj = await this.jsonHelper.loadKeyValues<T>();

		_set(obj as object, keyPath, value);

		return this.jsonHelper.saveKeyValues(obj);
	}

	/**
	 * Sets all key values.
	 *
	 * _For async method, use_ [`set()`].
	 *
	 * @param obj The new key values.
	 * @example
	 *
	 * Set all key values.
	 * ```js
	 * keyValues.setSync({ aqpw: 'nice' });
	 * ```
	 *
	 * @category Set Methods
	 */
	setSync<T extends ValueType>(obj: RecordType<T>): void;

	/**
	 * Sets the value at the given key path.
	 *
	 * _For async method, use_ [`set()`].
	 *
	 * @param keyPath The key path of the property.
	 * @param value The value to set.
	 * @example
	 *
	 * Change the value at `color.name` to `sapphire`.
	 * ```js
	 * // Given:
	 * {
	 * 	"color": {
	 *		"name": "cerulean",
	 *		"code": {
	 *			"rgb": [0, 179, 230],
	 *			"hex": "#003BE6"
	 *		}
	 *	}
	 * }
	 *
	 * keyValues.setSync('color.name', 'sapphire');
	 * ```
	 * @example
	 *
	 * Set the value of `color.hue` to `bluish`.
	 * ```js
	 * keyValues.setSync(['color', 'hue'], 'bluish);
	 * ```
	 * @example
	 *
	 * Change the value of `color.code`.
	 * ```js
	 * keyValues.setSync('color.code', { rgb: [16, 31, 134], hex: '#101F86' });
	 * ```
	 *
	 * @category Set Methods
	 */
	setSync<T extends ValueType>(keyPath: KeyPath, value: T): void;

	setSync<T extends ValueType>(...args: [RecordType<T>] | [KeyPath, T]): void {
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
	 * Gets all key values.
	 *
	 * _For sync method, use_ [`getSync()`].
	 *
	 * @returns A promise which resolves with all key values.
	 * @example
	 *
	 * Gets all key values.
	 * ```js
	 * const obj = await get();
	 * ```
	 *
	 * @category Get Methods
	 */
	async get<T extends ValueType>(): Promise<T>;

	/**
	 * Gets the value at the given key path.
	 *
	 * _For sync method, use_ [`getSync()`].
	 *
	 * @param keyPath The key path of the property.
	 * @returns A promise which resolves with the value at the given key path.
	 * @example
	 *
	 * Get the value at `color.name`.
	 * ```js
	 * // Given:
	 * {
	 * 	"color": {
	 * 		"name": "cerulean",
	 *		"code": {
	 *			"rgb": [0, 179, 230],
	 *			"hex": "#003BE6"
	 *		}
	 *	}
	 * }
	 *
	 * const value = await keyValues.get('color.name');
	 * // => "cerulean"
	 * ```
	 * @example
	 *
	 * Get the value at `color.code.hex`.
	 * ```js
	 * const hex = await keyValues.get('color.color.hex');
	 * // => "#003BE6"
	 * ```
	 * @example
	 *
	 * Get the value not existent at `color.hue`.
	 * ```js
	 * const value = await keyValues.get(['color', 'hue']);
	 * // => undefined
	 * ```
	 * @example
	 *
	 * Get the value at `color.code.rgb[1]`.
	 * ```js
	 * const value = await keyValues.get('color.code.rgb[1]');
	 * // => 179
	 * ```
	 *
	 * @category Get Methods
	 */
	async get<T extends ValueType>(keyPath: KeyPath): Promise<T>;

	async get<T extends ValueType>(keyPath?: KeyPath): Promise<T> {
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
			}

			throw new Error("Failed to get value: Unknown error");
		}
	}

	/**
	 * Gets all key values.
	 *
	 * _For async method, use_ [`get()`].
	 *
	 * @returns All key values.
	 * @example
	 *
	 * Gets all key values.
	 * ```js
	 * const obj = getSync();
	 * ```
	 *
	 * @category Get Methods
	 */
	getSync<T extends ValueType>(): T;

	/**
	 * Gets the value at the given key path.
	 *
	 * _For async method, use_ [`get()`].
	 *
	 * @param keyPath The key path of the property.
	 * @returns The value at the given key path.
	 * @example
	 *
	 * Get the value at `color.name`.
	 * ```js
	 * // Given:
	 * {
	 * 	"color": {
	 *		"name": "cerulean",
	 *		"code": {
	 *			"rgb": [0, 179, 230],
	 *			"hex": "#003BE6"
	 *		}
	 *	}
	 * }
	 *
	 * const value = keyValues.getSync('color.name');
	 * // => "cerulean"
	 * ```
	 * @example
	 *
	 * Get the value at `color.code.hex`.
	 * ```js
	 * const hex = keyValues.getSync('color.color.hex');
	 * // => "#003BE6"
	 * ```
	 * @example
	 *
	 * Get the value at `color.hue`.
	 * ```js
	 * const h = 'hue';
	 * const value = keyValues.getSync(['color', h]);
	 * // => undefined
	 * ```
	 * @example
	 *
	 * Get the value at `color.code.rgb[1]`.
	 * ```js
	 * const h = 'hue';
	 * const value = keyValues.getSync('color.code.rgb[1]');
	 * // => 179
	 * ```
	 *
	 * @example
	 * Get all values
	 * ```js
	 *  const values = keyValues.getSync();
	 * ```
	 *
	 * @category Get Methods
	 */
	getSync<T extends ValueType>(keyPath: KeyPath): T;

	getSync<T extends ValueType>(keyPath?: KeyPath): T {
		const obj = this.jsonHelper.loadKeyValuesSync<T>();

		if (keyPath) {
			return _get(obj, keyPath);
		}

		return obj;
	}

	/**
	 * Checks if the given key path exists.
	 *
	 * _For sync method, use_ [`hasSync()`].
	 *
	 * @param keyPath The key path to check.
	 * @returns A promise which resolves to `true` if the `keyPath` exists, else `false`.
	 * @example
	 *
	 * Check if the value at `color.name` exists.
	 * ```js
	 * // Given:
	 * {
	 * 	"color": {
	 *		"name": "cerulean",
	 *		"code": {
	 *			"rgb": [0, 179, 230],
	 *			"hex": "#003BE6"
	 *		}
	 *	}
	 * }
	 *
	 * const exists = await keyValues.has('color.name');
	 * // => true
	 * ```
	 * @example
	 *
	 * Check if the value at `color.hue` exists.
	 * ```js
	 * const exists = await keyValues.has(['color', 'hue']);
	 * // => false
	 * ```
	 *  @example
	 *
	 * Check if the value at `color.code.rgb[1]` exists.
	 * ```js
	 * const exists = await keyValues.has(color.code.rgb[1]);
	 * // => true
	 * ```
	 *
	 * @category Has Methods
	 */
	async has(keyPath: KeyPath): Promise<boolean> {
		const obj = await this.jsonHelper.loadKeyValues();
		return _has(obj, keyPath);
	}

	/**
	 * Checks if the given key path exists.
	 *
	 * _For async method, use_ [`has()`].
	 *
	 * @param keyPath The key path to check.
	 * @returns `true` if the `keyPath` exists, else `false`.
	 * @example
	 *
	 * Check if the value at `color.name` exists.
	 * ```js
	 * // Given:
	 * {
	 * 	"color": {
	 *		"name": "cerulean",
	 *		"code": {
	 *			"rgb": [0, 179, 230],
	 *			"hex": "#003BE6"
	 *		}
	 *	}
	 * }
	 *
	 * const exists = keyValues.hasSync('color.name');
	 * // => true
	 * ```
	 * @example
	 *
	 * Check if the value at `color.hue` exists.
	 * ```js
	 * const exists = keyValues.hasSync(['color', 'hue']);
	 * // => false
	 * ```
	 * @example
	 *
	 * Check if the value at `color.code.rgb[1]` exists.
	 * ```js
	 * const exists = keyValues.hasSync(color.code.rgb[1]);
	 * // => true
	 * ```
	 *
	 * @category Has Methods
	 */
	hasSync(keyPath: KeyPath): boolean {
		const obj = this.jsonHelper.loadKeyValuesSync();
		return _has(obj, keyPath);
	}

	/**
	 * Unsets all key values.
	 *
	 * _For sync method, use_ [`unsetSync()`].
	 *
	 * @returns A promise which resolves when the key values have been unset.
	 * @example
	 *
	 * Unsets all key values.
	 * ```js
	 * await keyValues.unset();
	 * await keyValues.get();
	 * // => undefined
	 * ```
	 *
	 * @category Unset Methods
	 */
	async unset(): Promise<boolean>;

	/**
	 * Unsets the property at the given key path.
	 *
	 * _For sync method, use_ [`unsetSync()`].
	 *
	 * @param keyPath The key path of the property.
	 * @returns A promise which resolves when the setting has been unset.
	 * @example
	 *
	 * Unset the property `color.name`.
	 * ```js
	 * // Given:
	 * {
	 * 	"color": {
	 *		"name": "cerulean",
	 *		"code": {
	 *			"rgb": [0, 179, 230],
	 *			"hex": "#003BE6"
	 *		}
	 *	}
	 * }
	 *
	 * await keyValues.unset('color.name');
	 * await keyValues.get('color.name');
	 * // => undefined
	 * ```
	 * @example
	 *
	 * Unset the property `color.code.rgba[1]`.
	 * ```js
	 * await keyValues.unset('color.code.rgba[1]');
	 * await keyValues.get('color.code.rgb');
	 * // => [0, null, 230]
	 * ```
	 *
	 * @category Unset Methods
	 */
	async unset(keyPath: KeyPath): Promise<boolean>;

	async unset(keyPath?: KeyPath): Promise<boolean> {
		const obj = await this.jsonHelper.loadKeyValues();

		if (JSON.stringify(obj) !== "{}") {
			if (keyPath && _unset(obj, keyPath)) {
				await this.jsonHelper.saveKeyValues(obj);
			} else {
				await this.jsonHelper.saveKeyValues({});
			}
			return true;
		}

		return false;
	}

	/**
	 * Unsets all key values.
	 *
	 * _For async method, use_ [`unset()`].
	 *
	 * @example
	 *
	 * Unsets all key values.
	 * ```js
	 * keyValues.unsetSync();
	 * ```
	 *
	 * @category Unset Methods
	 */
	unsetSync(): boolean;

	/**
	 * Unsets the property at the given key path.
	 *
	 * _For async method, use_ [`unset()`].
	 *
	 * @param keyPath The key path of the property.
	 * @example
	 *
	 * Unset the property `color.name`.
	 * ```js
	 * // Given:
	 * {
	 * 	"color": {
	 *		"name": "cerulean",
	 *		"code": {
	 *			"rgb": [0, 179, 230],
	 *			"hex": "#003BE6"
	 *		}
	 *	}
	 * }
	 *
	 * keyValues.unsetSync('color.name');
	 * keyValues.getSync('color.name');
	 * // => undefined
	 * ```
	 * @example
	 *
	 * Unset the property `color.code.rgba[1]`.
	 * ```js
	 * keyValues.unsetSync('color.code.rgba[1]');
	 * keyValues.getSync('color.code.rgb');
	 * // => [0, null, 230]
	 * ```
	 *
	 * @category Unset Methods
	 */
	unsetSync(keyPath: KeyPath): boolean;

	unsetSync(keyPath?: KeyPath): boolean {
		const obj = this.jsonHelper.loadKeyValuesSync();

		if (JSON.stringify(obj) !== "{}") {
			if (keyPath && _unset(obj, keyPath)) {
				this.jsonHelper.saveKeyValuesSync(obj);
			} else {
				// Unset all keyValues by saving empty object.
				this.jsonHelper.saveKeyValuesSync({});
			}

			return true;
		}

		return false;
	}
}
