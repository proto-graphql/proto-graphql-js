const base = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_mo]dules/", "__helpers__/"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/src/__generated__/extensions/",
    "<rootDir>/src/__tests__/",
  ],
};

module.exports = base;
