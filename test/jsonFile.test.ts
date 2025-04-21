import fs from 'node:fs';
import { KeyValues } from '../src/keyvalues';
import { JsonFileHelper } from '../src/internal/JsonFileHelper';

describe('KeyValues', () => {
	beforeAll(() => {
		//delete json file
		const kvs = new KeyValues();
		if (fs.existsSync(kvs.file())) {
			fs.unlinkSync(kvs.file());
		}
	});

	it('should return the path to the keyvalues file with default options', () => {
		const options: Options = {
			atomicSave: false,
			fileName: '',
			prettify: false,
			numSpaces: 0
		};

		// const kvs = new KeyValues(options);
		// kvs.setSync('hello', 'Hello World!');

		const jsonFileHelper = new JsonFileHelper(options);
		const filePath = jsonFileHelper.getJsonFilePath();

		expect(filePath).toMatch(/\keyvalues.json$/);
	});

	it('should return the path to the keyvalues file with empty directory and default file name', () => {
		const options: Options = {
			atomicSave: false,
			fileName: '',
			prettify: false,
			numSpaces: 0
		};

		const jsonFileHelper = new JsonFileHelper(options);
		const filePath = jsonFileHelper.getJsonFilePath();

		expect(filePath).toContain('keyvalues.json');
	});

	it('should load async key values from disk when file exists is empty', async () => {
		// Arrange
		const options = {
			fileName: 'keyvalues.json',
			prettify: true,
			numSpaces: 2,
			atomicSave: true
		};

		const jsonFileHelper = new JsonFileHelper(options);

		// Act
		const result = await jsonFileHelper.loadKeyValues();

		// Assert
		expect(result).toEqual({});
	});

	it('should save keyvalues to disk when given a valid object', async () => {
		// Initialize
		const options = {
			fileName: 'keyvalues.json',
			prettify: true,
			numSpaces: 2,
			atomicSave: true
		};
		const jsonFileHelper = new JsonFileHelper(options);
		const keyvalues = {
			name: 'Heliomar',
			age: 45,
			city: 'São Paulo - SP',
			country: 'Brazil'
		};

		// Invoke
		await jsonFileHelper.saveKeyValues(keyvalues);

		// Assert
		const filePath = jsonFileHelper.getJsonFilePath();
		const data = fs.readFileSync(filePath, 'utf-8');
		const savedKeyvalues = JSON.parse(data);
		expect(savedKeyvalues).toEqual(keyvalues);
	});

	it('should load keyvalues from disk when file exists and is not empty', () => {
		const options = {
			fileName: 'keyvalues.json',
			prettify: true,
			numSpaces: 2,
			atomicSave: false
		};

		const jsonFileHelper = new JsonFileHelper(options);
		const result = jsonFileHelper.loadKeyValuesSync();

		expect(result).toEqual({
			name: 'Heliomar',
			age: 45,
			city: 'São Paulo - SP',
			country: 'Brazil'
		});
	});

	it('should resolve with an empty object when file not exist', async () => {
		// Arrange
		const options = {
			fileName: 'nonexistent.json',
			prettify: true,
			numSpaces: 2,
			atomicSave: true
		};
		const jsonFileHelper = new JsonFileHelper(options);

		// Act
		const result = await jsonFileHelper.loadKeyValues();

		// Assert
		expect(result).toEqual({});
	});
});
