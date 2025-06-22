import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node", // Use jsdom for browser-like tests
		//reporters: ["verbose"], // Use verbose reporter for detailed output
		coverage: {
			reporter: ["text", "text-summary", "lcov", "json-summary", "json"],
			reportsDirectory: "./coverage",
			include: ["src"],
			exclude: ["src/**/*.d.ts"],
		},
	},
});
