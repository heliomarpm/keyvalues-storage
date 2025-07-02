import fs from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { KeyValues, type Options } from "../src";

const defaultOptions: Options = {
	atomicSave: true,
	dir: "localdb",
	fileName: "keyvalues.json",
	prettify: false,
	numSpaces: 2,
};

const options: Options = {
	atomicSave: false,
	dir: "localdb/data",
	fileName: "settings.json",
	prettify: true,
	numSpaces: 4,
};

const complex = {
	name: "complex",
	type: "object",
	properties: {
		height: 20,
		width: 20,
	},
};

const arrString = ["Teste1", "Teste2"];

interface IPerson {
	name: string;
	age: number;
}

const person: IPerson = {
	name: "John Doe",
	age: 30,
};

const persons: IPerson[] = [
	{ name: "John Doe", age: 30 },
	{ name: "Jane Doe", age: 33 },
];

// const t: IPerson = JSON.parse(p.toString());
// console.log(JSON.stringify(p.toString()));
// console.log('age', t.age);

const deleteFiles = async () => {
	//delete json file
	const kvs = new KeyValues(options);
	const kvsDefault = new KeyValues(defaultOptions);

	await fs.promises.rm(kvs.file(), { recursive: true, force: true });
	await fs.promises.rm(kvsDefault.file(), { recursive: true, force: true });
};

describe("KeyValues Default Test", () => {
	let kvs: KeyValues;

	beforeAll(async () => {
		await deleteFiles();
		kvs = new KeyValues(options);
	});

	afterAll(async () => {
		await deleteFiles();
	});

	// Returns a string representing the path to the json file.
	it("should return the default path to the json file", () => {
		const keyValues = new KeyValues();
		const filePath = keyValues.file();

		const expectedPath = path.join("localdb", "keyvalues.json");
		expect(filePath).toStrictEqual(expectedPath);
	});

	it("should reset options object to defaultOptions", () => {
		const keyValues = new KeyValues(options);
		keyValues.resetOptions();
		// biome-ignore lint/complexity/useLiteralKeys: intentional use of string key for test
		expect(keyValues["options"]).toEqual(defaultOptions);
	});

	it("test set/get property async", async () => {
		await kvs.set({ propAsync: true });
		expect(await kvs.get("propAsync")).toBeTruthy();
	});

	it("test set/get property (replace all key-values)", () => {
		kvs.setSync({ prop: true });

		expect(kvs.getSync("propAsync")).toBeUndefined();
		expect(kvs.getSync("prop")).toBeTruthy();
	});

	it("test set/get property (replace value)", () => {
		kvs.setSync("firstName", "John Doe");
		expect(kvs.getSync("firstName")).toBe("John Doe");

		kvs.setSync("firstName", "Heliomar Marques");
		expect(kvs.getSync("firstName")).toBe("Heliomar Marques");
	});

	it("test set/get property map", () => {
		const recNull: Record<string, null> = { recNull: null };
		kvs.setSync(recNull);
		const recStr: Record<string, string> = { recStr: "string" };
		kvs.setSync(recStr);
		const recNum: Record<string, number> = { recStr: 120 };
		kvs.setSync(recNum);
		const recBool: Record<string, true> = { recBool: true };
		kvs.setSync(recBool);
		const recObject: Record<string, object> = { recObject: { firstName: "Heliomar", lastName: "Marques" } };
		kvs.setSync(recObject);

		const recDictionary: Record<string, { firstName: string }> = { recDictionary: { firstName: "Heliomar" } };
		kvs.setSync(recDictionary);

		const recArray: Record<string, string[]> = { recArray: ["Heliomar", "Marques"] };
		kvs.setSync(recArray);

		expect(kvs.getSync("recNull")).toBeUndefined();
		expect(kvs.getSync("recStr")).toBeUndefined();
		expect(kvs.getSync("recNum")).toBeUndefined();
		expect(kvs.getSync("recBool")).toBeUndefined();
		expect(kvs.getSync("recObject")).toBeUndefined();
		expect(kvs.getSync("recDictionary")).toBeUndefined();
		expect(kvs.getSync("recArray")).not.toBeUndefined();
		expect(kvs.getSync("recArray")).toStrictEqual(["Heliomar", "Marques"]);

		kvs.setSync("recNull", Object.values(recNull)[0]);
		kvs.setSync("recStr", Object.values(recStr)[0]);
		kvs.setSync("recNum", Object.values(recNum)[0]);
		kvs.setSync("recBool", Object.values(recBool)[0]);
		kvs.setSync("recObject", Object.values(recObject)[0]);
		kvs.setSync("recDictionary", Object.values(recDictionary)[0]);
		kvs.setSync("recArray", Object.values(recArray)[0]);

		expect(kvs.getSync("recNull")).not.toBeUndefined();
		expect(kvs.getSync("recStr")).not.toBeUndefined();
		expect(kvs.getSync("recNum")).not.toBeUndefined();
		expect(kvs.getSync("recBool")).not.toBeUndefined();
		expect(kvs.getSync("recObject")).not.toBeUndefined();
		expect(kvs.getSync("recDictionary")).not.toBeUndefined();
		expect(kvs.getSync<string[]>("recArray")).toStrictEqual(["Heliomar", "Marques"]);
	});

	it("test set/get property Array", () => {
		kvs.setSync("settings", "pt-BR");

		expect(kvs.getSync("language")).toBeUndefined();
		expect(kvs.getSync("settings")).toBe("pt-BR");
	});

	it("test set/get property Array", () => {
		const keys = ["settings", "language"];
		kvs.setSync(keys, "pt-BR");

		expect(JSON.stringify(kvs.getSync("settings"))).toBe('{"language":"pt-BR"}');

		expect(kvs.getSync("language")).toBeUndefined();

		expect(kvs.getSync(keys)).toBe("pt-BR");
		expect(kvs.getSync(keys.join("."))).toBe("pt-BR");
	});

	it("test set/get property nested field", () => {
		kvs.setSync("settings.theme", "dark");
		expect(kvs.getSync<object>("settings")).toMatchObject({ language: "pt-BR", theme: "dark" });
	});

	it("test set/get property nested field", () => {
		const theme = { default: "dark" };
		kvs.setSync("settings", theme);
		expect(kvs.getSync<object>("settings")).toMatchObject(theme);
	});

	it("test set/get string async", async () => {
		await kvs.set("stringAsync", "start");
		expect(await kvs.get("stringAsync")).toBe("start");
	});

	it("test set/get string", () => {
		kvs.setSync("string", "end");
		expect(kvs.getSync("string")).toBe("end");
	});

	it("test set/get boolean async", async () => {
		await kvs.set("booleanAsync", true);
		expect(await kvs.get("booleanAsync")).toBeTruthy();
	});

	it("test set/get boolean", () => {
		kvs.setSync("boolean", false);
		expect(kvs.getSync("boolean")).toBeFalsy();
	});

	it("test set/get number async", async () => {
		await kvs.set("numberAsync", 2024);
		expect(await kvs.get("numberAsync")).toBe(2024);
	});

	it("test set/get decimal", () => {
		kvs.setSync("decimal", 2024.5);
		expect(kvs.getSync<number>("decimal")).toBeGreaterThanOrEqual(2024.5);
	});

	it("test set/get null async", async () => {
		await kvs.set("nullAsync", null);
		expect(await kvs.get("nullAsync")).toBeNull();
	});

	it("test set/get of null", () => {
		kvs.setSync<null>("null", null);
		expect(kvs.getSync<null>("null")).toBeNull();
	});

	it("test set/get complex object", () => {
		kvs.setSync("complex", complex);
		const r = kvs.getSync("complex");
		expect(typeof r).toEqual(typeof complex);
	});

	it("test get of object complex", () => {
		const o = kvs.getSync<typeof complex>("complex");
		expect(o.properties.height).toEqual(20);
	});

	it("test get<number> object.property.property", () => {
		const r = kvs.getSync<number>("complex.properties.width");
		expect(r).toEqual(20);
	});

	it("test get object.property", () => {
		const r = kvs.getSync<string>("complex.name");
		expect(r).toEqual("complex");
	});

	it("test set/get of interfae", () => {
		kvs.setSync<IPerson>("person", person);
		const r = kvs.getSync<IPerson>("person");
		expect(r.name).toEqual("John Doe");
	});

	it("test set/get of array map object", () => {
		const mapPerson = persons.map((person) => ({ ...person }));
		kvs.setSync("persons", mapPerson);
		const r = kvs.getSync<IPerson[]>("persons")!;
		expect(r[1].name).toEqual("Jane Doe");
	});

	it("test get of string (person[1].name)", () => {
		const r = kvs.getSync<string>("persons[1].name");
		expect(r).toEqual("Jane Doe");
	});

	it("test get of Record<string, string>(persons[1])", () => {
		const r = kvs.getSync<Record<string, string>>("persons[1]")!;
		expect(r.age).toEqual(33);
	});

	it("test set/get of array object", () => {
		kvs.setSync("persons_index", [{ ...persons }]);
		const r = kvs.getSync<IPerson[]>("persons_index")!;
		expect(r).toStrictEqual([{ ...persons }]);
	});

	it("test set/get of array string", () => {
		kvs.setSync("array", arrString);
		const r = kvs.getSync<string[]>("array");
		expect(r).toStrictEqual(arrString);
	});

	it("test get undefined value", () => {
		const r = kvs.getSync("undefined");
		expect(r).toBeUndefined();
	});

	it("test change value", () => {
		kvs.setSync("string", "change value");
		const r = kvs.getSync("string");
		expect(r).toBe("change value");
	});

	it("test get all async", async () => {
		const r = await kvs.get();
		expect(r).toBeDefined();
	});

	it("test get all", () => {
		const r = kvs.getSync();
		expect(r).toBeDefined();
	});

	it("test has propertie async", async () => {
		const r = await kvs.has("string");
		expect(r).toBeTruthy();
	});

	it("test unset propertie async", async () => {
		expect(await kvs.unset("string")).toBeTruthy();
		expect(await kvs.has("string")).toBeFalsy();
	});

	it("test has propertie", () => {
		expect(kvs.hasSync("complex")).toBeTruthy();
	});

	it("test unset propertie", () => {
		expect(kvs.unsetSync("complex")).toBeTruthy();
		expect(kvs.hasSync("complex")).toBeFalsy();
	});

	it("test has undefined propertie", () => {
		expect(kvs.hasSync("undefined")).toBeFalsy();
	});

	it("test unset undefined propertie", () => {
		expect(kvs.unsetSync("undefined")).toBeTruthy();
	});

	it("test unset/get ", () => {
		kvs.unsetSync("boolean");
		expect(kvs.getSync("boolean")).toBeUndefined();
	});

	it("test unsetAll/get all async", async () => {
		await kvs.unset();
		expect(kvs.getSync()).toEqual({});
	});

	it("test unsetAll/get all", () => {
		kvs.setSync("novoItem", true);
		expect(kvs.getSync("novoItem")).toBeTruthy();

		kvs.unset().then(() => {
			expect(kvs.get()).resolves.toEqual({});
		});
	});
});
