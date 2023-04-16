import { get as _get, set as _set, has as _has, unset as _unset } from 'lodash';

import './internal/types';
import { Utils } from './internal/utils'

/** @internal */
const defaultOptions: Options = {
  atomicSave: true,
  fileName: 'keyvalues.json',
  prettify: false,
  numSpaces: 2,
};

export class KeyValues {
  private options: Options = {
    ...defaultOptions,
  };

  private utils!: Utils;


  /**
 * Sets the configuration for KeyValues Settings. To reset
 * to defaults, use [[reset|reset()]].
 *
 * Defaults:
 *     {
 *       atomicSave: true,
 *       fileName: 'keyvalues.json',
 *       numSpaces: 2,
 *       prettify: false
 *     }
 *
 * @param customConfig The custom configuration to use.
 * @example
 *
 * Update the filename to `config.json` and prettify
 * the output.
 *
 *     new KeyValues({
 *       fileName: 'config.json',
 *       prettify: true
 *     });
 */
  constructor(options?: Partial<Options>) {
    if (options)
      this.options = { ...this.options, ...options };

    this.utils = new Utils(this.options);
  }

  /**
   * Returns the path to the json file.
   *
   * In general, the json file is stored in your app's
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
   * [[configure|configure()]].
   *
   * @returns The path to the keyvalues file.
   * @example
   *
   * Get the path to the keyvalues file.
   *
   *     keyValues.file();
   *     // => c:/users/<userprofile>/appdata/local/programs/<AppName>/keyvalues.json
   */
  file(): string {
    return this.utils.getJsonFilePath();
  }

  /**
   * Resets the KeyValues Settings configuration to defaults.
   *
   * @example
   *
   * Reset configuration to defaults.
   *
   *     keyValues.reset();
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
   *
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
   *
   * @example
   *
   * Check if the value at `color.hue` exists.
   *
   *     const h = 'hue';
   *     const exists = await keyValues.has(['color', h]);
   *     // => false
   *
   *  @example
   *
   * Check if the value at `color.code.rgb[1]` exists.
   *
   *     const exists = await keyValues.has(color.code.rgb[1]);
   *     // => true
   */
  async has(keyPath: KeyPath): Promise<boolean> {
    const obj = await this.utils.loadKeyValues();

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
   *
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
   *
   * @example
   *
   * Check if the value at `color.hue` exists.
   *
   *     const h = 'hue';
   *     const exists = keyValues.hasSync(['color', h]);
   *     // => false
   *
   * @example
   *
   * Check if the value at `color.code.rgb[1]` exists.
   *
   *     const exists = keyValues.hasSync(color.code.rgb[1]);
   *     // => true
   */
  hasSync(keyPath: KeyPath): boolean {
    const obj = this.utils.loadKeyValuesSync();

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
   *
   *     const obj = await get();
   */
  async get(): Promise<ValueObject>;

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
   *
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
   *     const value = await keyValues.get('color.name');
   *     // => "cerulean"
   *
   * @example
   *
   * Get the value at `color.hue`.
   *
   *     const h = 'hue';
   *     const value = await keyValues.get(['color', h]);
   *     // => undefined
   *
   * @example
   *
   * Get the value at `color.code.rgb[1]`.
   *
   *     const h = 'hue';
   *     const value = await keyValues.get('color.code.rgb[1]');
   *     // => 179
   */
  async get(keyPath: KeyPath): Promise<KeyValue>;

  async get(keyPath?: KeyPath): Promise<ValueObject | KeyValue> {
    const obj = await this.utils.loadKeyValues();

    if (keyPath) {
      return _get(obj, keyPath);
    } else {
      return obj;
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
   *
   *     const obj = getSync();
   */
  getSync(): ValueObject;

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
   *
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
   *     const value = keyValues.getSync('color.name');
   *     // => "cerulean"
   *
   * @example
   *
   * Get the value at `color.hue`.
   *
   *     const h = 'hue';
   *     const value = keyValues.getSync(['color', h]);
   *     // => undefined
   *
   * @example
   *
   * Get the value at `color.code.rgb[1]`.
   *
   *     const h = 'hue';
   *     const value = keyValues.getSync('color.code.rgb[1]');
   *     // => 179
   */
  getSync(keyPath: KeyPath): KeyValue;

  getSync(keyPath?: KeyPath): KeyValue {
    const obj = this.utils.loadKeyValuesSync();

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
   *
   *     await keyValues.set({ aqpw: 'nice' });
   */
  async set(obj: ValueObject): Promise<void>;

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
   *
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
   *
   * @example
   *
   * Set the value of `color.hue` to `blue-ish`.
   *
   *     const h = 'hue';
   *     await keyValues.set(['color', h], 'blue-ish);
   *
   * @example
   *
   * Change the value of `color.code`.
   *
   *     await keyValues.set('color.code', {
   *       rgb: [16, 31, 134],
   *       hex: '#101F86'
   *     });
   */
  async set(keyPath: KeyPath, obj: KeyValue): Promise<void>;

  async set(...args: [ValueObject] | [KeyPath, KeyValue]): Promise<void> {
    if (args.length === 1) {
      const [value] = args;

      return this.utils.saveKeyValues(value);
    } else {
      const [keyPath, value] = args;
      const obj = await this.utils.loadKeyValues();

      _set(obj, keyPath, value);

      return this.utils.saveKeyValues(obj);
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
   *
   *     keyValues.setSync({ aqpw: 'nice' });
   */
  setSync(obj: ValueObject): void;

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
   *
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
   *
   * @example
   *
   * Set the value of `color.hue` to `blue-ish`.
   *
   *     const h = 'hue';
   *     keyValues.setSync(['color', h], 'blue-ish);
   *
   * @example
   *
   * Change the value of `color.code`.
   *
   *     keyValues.setSync('color.code', {
   *       rgb: [16, 31, 134],
   *       hex: '#101F86'
   *     });
   */
  setSync(keyPath: KeyPath, value: KeyValue): void;

  setSync(...args: [ValueObject] | [KeyPath, KeyValue]): void {
    if (args.length === 1) {
      const [value] = args;

      this.utils.saveKeyValuesSync(value);
    } else {
      const [keyPath, value] = args;
      const obj = this.utils.loadKeyValuesSync();

      _set(obj, keyPath, value);

      this.utils.saveKeyValuesSync(obj);
    }
  }

  /**
   * Unsets all key values. For sync, use [[unsetSync|unsetSync()]].
   *
   * @category Core
   * @returns A promise which resolves when the key values have
   * been unset.
   * @example
   *
   * Unsets all key values.
   *
   *     await keyValues.unset();
   */
  async unset(): Promise<void>;

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
   *
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
   *
   * @example
   *
   * Unset the property `color.code.rgba[1]`.
   *
   *     await keyValues.unset('color.code.rgba[1]');
   *
   *     await keyValues.get('color.code.rgb');
   *     // => [0, null, 230]
   */
  async unset(keyPath: KeyPath): Promise<void>;

  async unset(keyPath?: KeyPath): Promise<void> {
    if (keyPath) {
      const obj = await this.utils.loadKeyValues();

      _unset(obj, keyPath);

      return this.utils.saveKeyValues(obj);
    } else {
      // Unset all keyValues by saving empty object.
      return this.utils.saveKeyValues({});
    }
  }

  /**
   * Unsets all key values. For async, use [[unset|unset()]].
   *
   * @category Core
   * @example
   *
   * Unsets all key values.
   *
   *     keyValues.unsetSync();
   */
  unsetSync(): void;

  /**
   * Unsets the property at the given key path. For async,
   * use [[unset|unset()]].
   *
   * @category Core
   * @param keyPath The key path of the property.
   * @example
   *
   * Unset the property `color.name`.
   *
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
   *
   * @example
   *
   * Unset the property `color.code.rgba[1]`.
   *
   *     keyValues.unsetSync('color.code.rgba[1]');
   *
   *     keyValues.getSync('color.code.rgb');
   *     // => [0, null, 230]
   */
  unsetSync(keyPath: KeyPath): void;

  unsetSync(keyPath?: KeyPath): void {
    if (keyPath) {
      const obj = this.utils.loadKeyValuesSync();

      _unset(obj, keyPath);

      this.utils.saveKeyValuesSync(obj);
    } else {
      // Unset all keyValues by saving empty object.
      this.utils.saveKeyValuesSync({});
    }
  }
}

