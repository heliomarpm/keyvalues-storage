/**
 * `Options` types contain all the configuration options for
 * Options that can be set in the constructor of KeyValues Class
 *
 * @example
 *
 * ```js
 * const kvs = new KeyValues({fileName: 'config.json'})
 * ```
 *
 * @category Types
 */
type Options = {
	/**
	 * Whether or not to save the settings file atomically.
	 *
	 * @default true
	 */
	atomicSave: boolean;

	/**
	 * The path to the settings directory.
	 * Defaults to your app's user data direcory.
	 *
	 * @default "localdb"
	 */
	dir?: string;

	// /**
	//  * A custom Electron instance to use. Great for testing!
	//  */
	// electron?: typeof Electron;

	/**
	 * The name of the settings file that will be saved to the disk.
	 *
	 * @default "keyvalues.json"
	 */
	fileName: string;

	/**
	 * Whether or not to prettify the data when it's saved to disk.
	 *
	 * @default false
	 */
	prettify: boolean;

	/**
	 * The number of spaces to use when stringifying the data
	 * before saving to disk if `prettify` is set to `true`.
	 *
	 * @default 2
	 */
	numSpaces: number;
};

/**
 * `KeyPath` is a type that represents a key path in a key-value pair.
 *
 * It can be a string or an array of strings.
 * @example
 * ```js
 * const keyPath: KeyPath = "user.name";
 * const keyPathArray: KeyPath = ["user", "name"]; // This type is used to access nested properties in an object.
 * ```
 * @typedef {string | Array<string>} KeyPath
 *
 * @category Types
 **/
type KeyPath = string | Array<string>;

/**
 * `ValueType` is a type that represents the possible values that can be stored in a key-value pair.
 *
 * It can be null, string, number, boolean, object, DictionaryType, or an array of ValueType.
 * @example
 * ```js
 * await keyValues.set("createdAt", "2023-04-16");
 * await keyValues.set("levels", [1, 2, 3]);
 * await keyValues.set("family, [{ name: "John" }, { name: "Jane" }]);
 * await keyValues.get(); //get all
 * // Output:
 * {
 * 	createdAt: "2023-04-16",
 * 	levels: [1, 2, 3],
 * 	family: [
 * 		{ name: "John" },
 * 		{ name: "Jane" }
 * 	]
 * }
 * ```
 * @typedef {null | string | number | boolean | object | DictionaryType | Array<ValueType>}
 *
 * @category Types
 */
type ValueType = null | string | number | boolean | object | DictionaryType | Array<ValueType>;

/**
 * `RecordType` is a type that represents an object with string keys and values of type `T`, where `T` is a subtype of `ValueType`.
 *
 * This type is used to define the structure of key-value pairs.
 * @typedef {Record<string, T>} Types
 * @example
 * ```js *
 * await keyValues.set({ createdAt: "2023-04-16" });
 * await keyValues.set({ levels: [1, 2, 3] });
 * await keyValues.set({ family: [{ name: "John" }, { name: "Jane" }] });
 * await keyValues.get(); //get all
 * // Output:
 * {
 * 	createdAt: "2023-04-16",
 * 	levels: [1, 2, 3],
 * 	family: [
 * 		{ name: "John" },
 * 		{ name: "Jane" }
 * 	]
 * }
 * ```
 * @category Types
 */
type RecordType<T extends ValueType> = Record<string, T>;

/**
 * `DictionaryType` is a type that represents an object with string keys and values of type `ValueType`.
 *
 * This type is used to define a dictionary-like structure where each key maps to a value of various types.
 * @typedef {Record<string, ValueType>} dictionaryType
 * @category Types
 * @internal
 * @ignore
 */
type DictionaryType = { [key: string]: ValueType };

export type { Options, KeyPath, ValueType, RecordType, DictionaryType };
