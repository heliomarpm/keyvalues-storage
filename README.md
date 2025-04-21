<div id="top" align="center" style="text-align:center;">
<h1>
  <br>🎲 KeyValues Storage

  [![DeepScan grade][url-deepscan-badge]][url-deepscan]
  [![CodeFactor][url-codefactor-badge]][url-codefactor] 
  ![CodeQL][url-codeql]<!-- ![Publish][url-publish] --> [![NPM version][url-npm-badge]][url-npm]
  [![Downloads][url-downloads-badge]][url-downloads]
  <a href="https://navto.me/heliomarpm" target="_blank"><img src="https://navto.me/assets/navigatetome-brand.png" width="32"/></a>

  ![lodash](https://img.shields.io/github/package-json/dependency-version/heliomarpm/keyvalues-storage/lodash)
  ![write-file-atomic](https://img.shields.io/github/package-json/dependency-version/heliomarpm/keyvalues-storage/write-file-atomic)
  <!-- ![jest](https://img.shields.io/github/package-json/dependency-version/heliomarpm/keyvalues-storage/dev/jest) -->
</h1>

<p>
  <!-- PixMe -->
  <!-- <a href="https://www.pixme.bio/heliomarpm" target="_blank" rel="noopener noreferrer">
    <img alt="pixme url" src="https://img.shields.io/badge/donate%20on-pixme-1C1E26?style=for-the-badge&labelColor=1C1E26&color=28f4f4"/>
  </a> -->
  <!-- PayPal -->
  <a href="https://bit.ly/paypal-sponsor-heliomarpm" target="_blank" rel="noopener noreferrer">
    <img alt="paypal url" src="https://img.shields.io/badge/donate%20on-paypal-1C1E26?style=for-the-badge&labelColor=1C1E26&color=0475fe"/>
  </a>
  <!-- Ko-fi -->
  <a href="https://ko-fi.com/heliomarpm" target="_blank" rel="noopener noreferrer">
    <img alt="kofi url" src="https://img.shields.io/badge/kofi-1C1E26?style=for-the-badge&labelColor=1C1E26&color=ff5f5f"/>
  </a>
  <!-- LiberaPay -->  
  <a href="https://liberapay.com/heliomarpm" target="_blank" rel="noopener noreferrer">
     <img alt="liberapay url" src="https://img.shields.io/badge/liberapay-1C1E26?style=for-the-badge&labelColor=1C1E26&color=f6c915"/>
  </a>
  <!-- GitHub Sponsors -->
  <a href="https://github.com/sponsors/heliomarpm" target="_blank" rel="noopener noreferrer">
    <img alt="github sponsors url" src="https://img.shields.io/badge/GitHub%20-Sponsor-1C1E26?style=for-the-badge&labelColor=1C1E26&color=db61a2"/>
  </a>
  <br>
  <!-- Version -->
  <!-- <a href="https://github.com/heliomarpm/keyvalues-storage/releases" target="_blank" rel="noopener noreferrer">
     <img alt="releases url" src="https://img.shields.io/github/v/release/heliomarpm/keyvalues-storage?style=for-the-badge&labelColor=1C1E26&color=2ea043"/>
  </a>   -->
  <!-- License -->
  <!-- <a href="https://github.com/heliomarpm/keyvalues-storage/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
    <img alt="license url" src="https://img.shields.io/badge/license%20-MIT-1C1E26?style=for-the-badge&labelColor=1C1E26&color=61ffca"/>
  </a> -->
</p>
</div>

## Summary
The `KeyValues Storage` library is a utility for managing key-value pairs and storing them in a JSON file. It provides methods for setting, getting, checking existence, and removing key-value pairs. This document provides an overview of the library and its usage.

## Installation

You can install the library using `npm` or `yarn`:

```bash
npm i @heliomarpm/kvs
# or 
yarn add @heliomarpm/kvs
```

## Example Usage

```javascript
// Create a new instance of KeyValues with or or without custom options

/**
 * Default Options
 * 
 * {
 *   atomicSave: true,
 *   fileName: 'keyvalues.json',
 *   prettify: false,
 *   numSpaces: 2,
 * }
 */
const kvs = new KeyValues()
-- or --
const kvs = new KeyValues({
  fileName: 'config.json',
  prettify: true
});

const color =
{
    "name": "cerulean",
    "code": {
				"hex": "#003BE6",
        "rgb": [0, 179, 230]
    }
}

// Set a key-value
kvs.setSync(['settings', 'language'], "pt-Br");
kvs.getSync(['settings', 'language'])	
// => 'pt-Br'

// Set/Add a key settings
kvs.setSync("settings.default", "en");
kvs.getSync("settings")
// => { "language": "pt-Br", "default": "en" }

kvs.getSync();	
// => { "settings": { "language": "pt-Br", "default": "en" } }

// replace key settings
kvs.setSync("settings", { theme: "dark"});
kvs.getSync("settings")
// => { "theme": "dark" }

// Added a new key-value
kvs.setSync("color", color);
kvs.getSync();
// => { "theme": "dark", "color": { "name": "cerulean", "code": { "rgb": [0, 179, 230], "hex": "#003BE6" } } }

// Replace all key-values
kvs.setSync(color);
kvs.getSync();
// => { "name": "cerulean", "code": { "rgb": [0, 179, 230], "hex": "#003BE6" } }

// Unset a key-value
kvs.unsetSync();
kvs.getSync();
// => {}

// Set a new key-values
kvs.setSync("color", color);
kvs.getSync();	
// => { "color": { "name": "cerulean", "code": { "rgb": [0, 179, 230], "hex": "#003BE6" } } }

kvs.getSync("color.name")
// => "cerulean"

kvs.getSync("color.code.hex")
// => "#003BE6"

kvs.getSync(["color", "code"])
-- or --
kvs.getSync("color.code")
// => { "hex": "#003BE6", "rgb": [0, 179, 230] }

kvs.getSync(["color", "hue"])
// => undefined

// Set a key-value pair
await kvs.set("color.name", "sapphire");

// Get the value at a specific key path
const value = await kvs.get("color.name");
// => "sapphire"

// Check if a key path exists
const exists = await kvs.has("color.name");
// => true

// Remove a key-value pair
await kvs.unset("color.name");
await kvs.get(); 
// => { "code": { "rgb": [0, 179, 230], "hex": "#003BE6" } }

const exists = kvs.hasSync("color.name");
// => false

kvs.unset().then(() => {
	console.log("All key-value pairs have been removed.");
})
```

## Code Analysis
### Main functionalities
- Manage key-value pairs and store them in a JSON file
- Create one or more instances for different JSON files
- Set and get values at specific key paths
- Check if a key path exists
- Remove key-value pairs
___
### Methods
- `constructor(options?: Partial<Options>)`: Initializes a new instance of the `KeyValues` class with optional custom options.
- `file(): string`: Returns the path to the JSON file.
- `reset(): void`: Resets the configuration of the `KeyValues` instance to default options.
- `has(keyPath: KeyPath): Promise<boolean>`: Checks if a key path exists asynchronously.
- `hasSync(keyPath: KeyPath): boolean`: Checks if a key path exists synchronously.
- `get<T extends valueTypes>(keyPath?: KeyPath): Promise<T>`: Gets the value at a specific key path asynchronously.
- `getSync<T extends valueTypes>(keyPath?: KeyPath): T`: Gets the value at a specific key path synchronously.
- `set<T extends valueTypes>(...args: [Types<T>] | [KeyPath, T]): Promise<void>`: Sets a value at a specific key path asynchronously.
- `setSync<T extends valueTypes>(...args: [Types<T>] | [KeyPath, T]): void`: Sets a value at a specific key path synchronously.
- `unset(keyPath?: KeyPath): Promise<void>`: Removes a key-value pair at a specific key path asynchronously.
- `unsetSync(keyPath?: KeyPath): void`: Removes a key-value pair at a specific key path synchronously.
___
### Fields
- `options: Options`: The configuration options for the `KeyValues` instance.
- `fnc: Functions`: An instance of the `Functions` class used for file operations and data manipulation.


## Dependencies

- [lodash](https://lodash.com/): The Lodash library exported as Node.js modules.
- [write-file-atomic](https://github.com/npm/write-file-atomic): Atomically and asynchronously writes data to a file, replacing the file if it already exists. data can be a string or a buffer


# Contributing

Please make sure to read the [Contributing Guide](docs/CONTRIBUTING.md) before making a pull request.


Thank you to all the people who already contributed to project!

<a href="https://github.com/heliomarpm/keyvalues-storage/graphs/contributors" target="_blank">
  <img src="https://contrib.rocks/image?repo=heliomarpm/keyvalues-storage" />
</a>

###### Made with [contrib.rocks](https://contrib.rocks).

That said, there's a bunch of ways you can contribute to this project, like by:

- :beetle: Reporting a bug
- :page_facing_up: Improving this documentation
- :rotating_light: Sharing this project and recommending it to your friends
- :dollar: Supporting this project on GitHub Sponsors or Ko-fi
- :star2: Giving a star on this repository


## Donate

If you appreciate that, please consider donating to the Developer.

<p>
  <!-- PixMe -->
  <!-- <a href="https://www.pixme.bio/heliomarpm" target="_blank" rel="noopener noreferrer">
    <img alt="pixme url" src="https://img.shields.io/badge/donate%20on-pixme-1C1E26?style=for-the-badge&labelColor=1C1E26&color=28f4f4"/>
  </a> -->
  <!-- PayPal -->
  <a href="https://bit.ly/paypal-sponsor-heliomarpm" target="_blank" rel="noopener noreferrer">
    <img alt="paypal url" src="https://img.shields.io/badge/donate%20on-paypal-1C1E26?style=for-the-badge&labelColor=1C1E26&color=0475fe"/>
  </a>
  <!-- Ko-fi -->
  <a href="https://ko-fi.com/heliomarpm" target="_blank" rel="noopener noreferrer">
    <img alt="kofi url" src="https://img.shields.io/badge/kofi-1C1E26?style=for-the-badge&labelColor=1C1E26&color=ff5f5f"/>
  </a>
  <!-- LiberaPay -->  
  <a href="https://liberapay.com/heliomarpm" target="_blank" rel="noopener noreferrer">
     <img alt="liberapay url" src="https://img.shields.io/badge/liberapay-1C1E26?style=for-the-badge&labelColor=1C1E26&color=f6c915"/>
  </a>  
  <!-- GitHub Sponsors -->
  <a href="https://github.com/sponsors/heliomarpm" target="_blank" rel="noopener noreferrer">
    <img alt="github sponsors url" src="https://img.shields.io/badge/GitHub%20-Sponsor-1C1E26?style=for-the-badge&labelColor=1C1E26&color=db61a2"/>
  </a>
</p>

## License

[MIT © Heliomar P. Marques](LICENSE) <a href="#top">🔝</a>


----
[url-npm]: https://www.npmjs.com/package/@heliomarpm/kvs
[url-npm-badge]: https://img.shields.io/npm/v/@heliomarpm/kvs.svg
[url-downloads-badge]: https://img.shields.io/npm/dm/@heliomarpm/kvs.svg
[url-downloads]: http://badge.fury.io/js/@heliomarpm/kvs.svg
[url-deepscan-badge]: https://deepscan.io/api/teams/19612/projects/25344/branches/791226/badge/grade.svg
[url-deepscan]: https://deepscan.io/dashboard#view=project&tid=19612&pid=25344&bid=791226
[url-codefactor-badge]: https://www.codefactor.io/repository/github/heliomarpm/keyvalues-storage/badge
[url-codefactor]: https://www.codefactor.io/repository/github/heliomarpm/keyvalues-storage
[url-codeql]: https://github.com/heliomarpm/keyvalues-storage/actions/workflows/codeql.yml/badge.svg 
[url-publish]: https://github.com/heliomarpm/keyvalues-storage/actions/workflows/publish.yml/badge.svg 
