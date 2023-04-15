import { get as _get, set as _set, has as _has, unset as _unset } from 'lodash';

import './types';
import { Utils } from './utils'

/** @internal */
const defaultOptions: Options = {
  atomicSave: true,
  fileName: 'settings.json',
  prettify: false,
  numSpaces: 2,
};

export class Settings {
  /** @internal */
  options: Options = {
    ...defaultOptions,
  };

  /** @internal */
  utils!: Utils;


  /**
 * Sets the configuration for Electron Settings. To reset
 * to defaults, use [[reset|reset()]].
 *
 * Defaults:
 *
 *     {
 *       atomicSave: true,
 *       fileName: 'settings.json',
 *       numSpaces: 2,
 *       prettify: false
 *     }
 *
 * @param customConfig The custom configuration to use.
 * @example
 *
 * Update the filename to `cool-settings.json` and prettify
 * the output.
 *
 *     new Settings({
 *       fileName: 'cool-settings.json',
 *       prettify: true
 *     });
 */
  constructor(options?: Partial<Options>) {
    if (options)
      this.options = { ...this.options, ...options };

    this.utils = new Utils(this.options);
  }

  /**
   * Returns the path to the settings file.
   *
   * In general, the settings file is stored in your app's
   * user data directory in a file called `settings.json`.
   * The default user data directory varies by system.
   *
   * - **macOS** - `~/Library/Application\ Support/<Your App>`
   * - **Windows** - `%APPDATA%/<Your App>`
   * - **Linux** - Either `$XDG_CONFIG_HOME/<Your App>` or
   * `~/.config/<Your App>`
   *
   * Although it is not recommended, you may change the name
   * or location of the settings file using
   * [[configure|configure()]].
   *
   * @returns The path to the settings file.
   * @example
   *
   * Get the path to the settings file.
   *
   *     settings.file();
   *     // => /home/nathan/.config/MyApp/settings.json
   */
  file(): string {
    return this.utils.getSettingsFilePath();
  }

  /**
   * Resets the Electron Settings configuration to defaults.
   *
   * @example
   *
   * Reset configuration to defaults.
   *
   *     settings.reset();
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
   *     const exists = await settings.has('color.name');
   *     // => true
   *
   * @example
   *
   * Check if the value at `color.hue` exists.
   *
   *     const h = 'hue';
   *     const exists = await settings.has(['color', h]);
   *     // => false
   *
   *  @example
   *
   * Check if the value at `color.code.rgb[1]` exists.
   *
   *     const exists = await settings.has(color.code.rgb[1]);
   *     // => true
   */
  async has(keyPath: KeyPath): Promise<boolean> {
    const obj = await this.utils.loadSettings();

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
   *     const exists = settings.hasSync('color.name');
   *     // => true
   *
   * @example
   *
   * Check if the value at `color.hue` exists.
   *
   *     const h = 'hue';
   *     const exists = settings.hasSync(['color', h]);
   *     // => false
   *
   * @example
   *
   * Check if the value at `color.code.rgb[1]` exists.
   *
   *     const exists = settings.hasSync(color.code.rgb[1]);
   *     // => true
   */
  hasSync(keyPath: KeyPath): boolean {
    const obj = this.utils.loadSettingsSync();

    return _has(obj, keyPath);
  }

  /**
   * Gets all settings. For sync, use
   * [[getSync|getSync()]].
   *
   * @category Core
   * @returns A promise which resolves with all settings.
   * @example
   *
   * Gets all settings.
   *
   *     const obj = await get();
   */
  async get(): Promise<SettingsObject>;

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
   *     const value = await settings.get('color.name');
   *     // => "cerulean"
   *
   * @example
   *
   * Get the value at `color.hue`.
   *
   *     const h = 'hue';
   *     const value = await settings.get(['color', h]);
   *     // => undefined
   *
   * @example
   *
   * Get the value at `color.code.rgb[1]`.
   *
   *     const h = 'hue';
   *     const value = await settings.get('color.code.rgb[1]');
   *     // => 179
   */
  async get(keyPath: KeyPath): Promise<SettingsValue>;

  async get(keyPath?: KeyPath): Promise<SettingsObject | SettingsValue> {
    const obj = await this.utils.loadSettings();

    if (keyPath) {
      return _get(obj, keyPath);
    } else {
      return obj;
    }
  }

  /**
   * Gets all settings. For async, use [[get|get()]].
   *
   * @category Core
   * @returns All settings.
   * @example
   *
   * Gets all settings.
   *
   *     const obj = getSync();
   */
  getSync(): SettingsObject;

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
   *     const value = settings.getSync('color.name');
   *     // => "cerulean"
   *
   * @example
   *
   * Get the value at `color.hue`.
   *
   *     const h = 'hue';
   *     const value = settings.getSync(['color', h]);
   *     // => undefined
   *
   * @example
   *
   * Get the value at `color.code.rgb[1]`.
   *
   *     const h = 'hue';
   *     const value = settings.getSync('color.code.rgb[1]');
   *     // => 179
   */
  getSync(keyPath: KeyPath): SettingsValue;

  getSync(keyPath?: KeyPath): SettingsValue {
    const obj = this.utils.loadSettingsSync();

    if (keyPath) {
      return _get(obj, keyPath);
    } else {
      return obj;
    }
  }

  /**
   * Sets all settings. For sync, use [[setSync|setSync()]].
   *
   * @category Core
   * @param obj The new settings.
   * @returns A promise which resolves when the settings have
   * been set.
   * @example
   *
   * Set all settings.
   *
   *     await settings.set({ aqpw: 'nice' });
   */
  async set(obj: SettingsObject): Promise<void>;

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
   *     await settings.set('color.name', 'sapphire');
   *
   * @example
   *
   * Set the value of `color.hue` to `blue-ish`.
   *
   *     const h = 'hue';
   *     await settings.set(['color', h], 'blue-ish);
   *
   * @example
   *
   * Change the value of `color.code`.
   *
   *     await settings.set('color.code', {
   *       rgb: [16, 31, 134],
   *       hex: '#101F86'
   *     });
   */
  async set(keyPath: KeyPath, obj: SettingsValue): Promise<void>;

  async set(...args: [SettingsObject] | [KeyPath, SettingsValue]): Promise<void> {
    if (args.length === 1) {
      const [value] = args;

      return this.utils.saveSettings(value);
    } else {
      const [keyPath, value] = args;
      const obj = await this.utils.loadSettings();

      _set(obj, keyPath, value);

      return this.utils.saveSettings(obj);
    }
  }

  /**
   * Sets all settings. For async, use [[set|set()]].
   *
   * @category Core
   * @param obj The new settings.
   * @example
   *
   * Set all settings.
   *
   *     settings.setSync({ aqpw: 'nice' });
   */
  setSync(obj: SettingsObject): void;

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
   *     settings.setSync('color.name', 'sapphire');
   *
   * @example
   *
   * Set the value of `color.hue` to `blue-ish`.
   *
   *     const h = 'hue';
   *     settings.setSync(['color', h], 'blue-ish);
   *
   * @example
   *
   * Change the value of `color.code`.
   *
   *     settings.setSync('color.code', {
   *       rgb: [16, 31, 134],
   *       hex: '#101F86'
   *     });
   */
  setSync(keyPath: KeyPath, value: SettingsValue): void;

  setSync(...args: [SettingsObject] | [KeyPath, SettingsValue]): void {
    if (args.length === 1) {
      const [value] = args;

      this.utils.saveSettingsSync(value);
    } else {
      const [keyPath, value] = args;
      const obj = this.utils.loadSettingsSync();

      _set(obj, keyPath, value);

      this.utils.saveSettingsSync(obj);
    }
  }

  /**
   * Unsets all settings. For sync, use [[unsetSync|unsetSync()]].
   *
   * @category Core
   * @returns A promise which resolves when the settings have
   * been unset.
   * @example
   *
   * Unsets all settings.
   *
   *     await settings.unset();
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
   *     await settings.unset('color.name');
   *
   *     await settings.get('color.name');
   *     // => undefined
   *
   * @example
   *
   * Unset the property `color.code.rgba[1]`.
   *
   *     await settings.unset('color.code.rgba[1]');
   *
   *     await settings.get('color.code.rgb');
   *     // => [0, null, 230]
   */
  async unset(keyPath: KeyPath): Promise<void>;

  async unset(keyPath?: KeyPath): Promise<void> {
    if (keyPath) {
      const obj = await this.utils.loadSettings();

      _unset(obj, keyPath);

      return this.utils.saveSettings(obj);
    } else {
      // Unset all settings by saving empty object.
      return this.utils.saveSettings({});
    }
  }

  /**
   * Unsets all settings. For async, use [[unset|unset()]].
   *
   * @category Core
   * @example
   *
   * Unsets all settings.
   *
   *     settings.unsetSync();
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
   *     settings.unsetSync('color.name');
   *
   *     settings.getSync('color.name');
   *     // => undefined
   *
   * @example
   *
   * Unset the property `color.code.rgba[1]`.
   *
   *     settings.unsetSync('color.code.rgba[1]');
   *
   *     settings.getSync('color.code.rgb');
   *     // => [0, null, 230]
   */
  unsetSync(keyPath: KeyPath): void;

  unsetSync(keyPath?: KeyPath): void {
    if (keyPath) {
      const obj = this.utils.loadSettingsSync();

      _unset(obj, keyPath);

      this.utils.saveSettingsSync(obj);
    } else {
      // Unset all settings by saving empty object.
      this.utils.saveSettingsSync({});
    }
  }
}

