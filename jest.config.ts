export default {
    clearMocks: true,
    coverageProvider: "v8",
    preset: "ts-jest/presets/js-with-ts",
    setupFiles: ["dotenv/config"],
    testEnvironment: 'node',
    transform: {
        "^.+\\.mjs$": "ts-jest",
    },
    modulePathIgnorePatterns: ["node_modules/"]
};