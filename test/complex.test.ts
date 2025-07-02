import { describe, expect, it, vi } from "vitest";

import { JsonFileHelper } from "../src/core/utils";
import { KeyValues } from "../src";

describe("Codium Complex Test", () => {
	// Tests that the set method sets the value of a nested key
	it("should set the value of a nested key", async () => {
		const mockLoadKeyValues = vi.spyOn(JsonFileHelper.prototype, "loadKeyValues");
		const mockSaveKeyValues = vi.spyOn(JsonFileHelper.prototype, "saveKeyValues");

		mockLoadKeyValues.mockResolvedValue({ parent: {} });

		const kvs = new KeyValues({ fileName: "complex.json", prettify: true });
		await kvs.set("parent.child", "value");

		expect(mockLoadKeyValues).toHaveBeenCalled();
		expect(mockSaveKeyValues).toHaveBeenCalledWith({ parent: { child: "value" } });
		mockLoadKeyValues.mockRestore();
		mockSaveKeyValues.mockRestore();
	});

	it("should remove a key and its value", async () => {
		const mockLoadKeyValues = vi.spyOn(JsonFileHelper.prototype, "loadKeyValues");
		const mockSaveKeyValues = vi.spyOn(JsonFileHelper.prototype, "saveKeyValues");
		mockLoadKeyValues.mockResolvedValue({ key: "value" });

		const kvs = new KeyValues({ fileName: "complex.json", prettify: true });
		await kvs.unset("key");

		expect(mockLoadKeyValues).toHaveBeenCalled();
		expect(mockSaveKeyValues).toHaveBeenCalledWith({});
		mockLoadKeyValues.mockRestore();
		mockSaveKeyValues.mockRestore();
	});

	it("shold get complex value", () => {
		const color = {
			name: "cerulean",
			code: {
				rgb: [0, 179, 230],
				hex: "#003BE6",
			},
		};
		const keyValues = new KeyValues({ fileName: "color.json", prettify: true });

		keyValues.setSync("color", color);
		expect(keyValues.getSync("color")).toEqual(color);

		expect(keyValues.getSync("color.name")).toEqual("cerulean");
		expect(keyValues.getSync("color.code.hex")).toEqual("#003BE6");
		expect(keyValues.getSync(["color", "code"])).toEqual({ hex: "#003BE6", rgb: [0, 179, 230] });

		expect(keyValues.getSync(["color", "hue"])).toBeUndefined();
	});
});
