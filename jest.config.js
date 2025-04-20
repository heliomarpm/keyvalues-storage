module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	coveragePathIgnorePatterns: [
		"/node_modules/",
		"dist"
	],
	"moduleNameMapper": {
		"@/(.*)$": "<rootDir>/src/$1"
	}
};
