
/**
 * `Config` types contain all the configuration options for
 * Electron Settings that can be set using
 * [[configure|configure()]].
 */
type Options = {
    /**
     * Whether or not to save the settings file atomically.
     */
    atomicSave: boolean;

    /**
     * The path to the settings directory. Defaults to your
     * app's user data direcory.
     */
    dir?: string;

    // /**
    //  * A custom Electron instance to use. Great for testing!
    //  */
    // electron?: typeof Electron;

    /**
     * The name of the settings file that will be saved to
     * the disk.
     */
    fileName: string;

    /**
     * Whether or not to prettify the data when it's saved to
     * disk.
     */
    prettify: boolean;

    // /**
    //  * The number of spaces to use when stringifying the data
    //  * before saving to disk if `prettify` is set to `true`.
    //  */
    numSpaces: number;
};

type KeyPath = string | Array<string | number>;
type SettingsValue = null | boolean | string | number | SettingsObject | SettingsValue[];
type SettingsObject = {
    [key: string]: SettingsValue;
}
