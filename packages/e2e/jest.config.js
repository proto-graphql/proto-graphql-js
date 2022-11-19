// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  projects: require("glob")
    .sync("./e2e/*/tsconfig.json")
    .map((tsconfigPath) => {
      return {
        preset: "ts-jest",
        testEnvironment: "node",
        rootDir: path.dirname(tsconfigPath),
      };
    }),
  globals: {
    "ts-jest": {
      // typecheck on other process
      diagnostics: false,
    },
  },
};
