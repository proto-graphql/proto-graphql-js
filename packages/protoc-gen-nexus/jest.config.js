const base = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_mo]dules/", "__helpers__/"],
  coveragePathIgnorePatterns: ["/node_modules/", "<rootDir>/src/__generated__/extensions/", "<rootDir>/src/__tests__/"],
};

if (process.env.TEST_TARGET === "integration") {
  base.testRegex = "__integration__/.*\\.test\\.ts$";
  base.testTimeout = 30000;
} else {
  base.testPathIgnorePatterns.push("__integration__/");
}

module.exports = base;
