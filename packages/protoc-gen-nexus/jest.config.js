module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "__helpers__/"],
  coveragePathIgnorePatterns: ["/node_modules/", "__helpers__/"],
};
