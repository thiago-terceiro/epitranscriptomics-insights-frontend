import nextJest from "next/jest";

const createJestConfig = nextJest({
    dir: "./",
});

const config = {
    testEnvironment: "jest-environment-jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/app/$1",
    },
    testMatch: ["<rootDir>/**/*.test.ts", "<rootDir>/**/*.test.tsx", "<rootDir>/**/*.spec.ts", "<rootDir>/**/*.spec.tsx"],
    modulePathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
    moduleDirectories: ["node_modules", "<rootDir>/"],
    collectCoverageFrom: [
        "<rootDir>/app/components/**/*.{ts,tsx}",
        "<rootDir>/app/api/upload/**/*.{ts,tsx}",
    ],
};

export default createJestConfig(config);
