// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  projects: require("glob")
    .sync("./**/tsconfig.json")
    .map((tsconfigPath) => ({
      preset: "ts-jest",
      testEnvironment: "node",
      rootDir: path.dirname(tsconfigPath),
      globals: {
        "ts-jest": {
          tsconfig: tsconfigPath,
          diagnostics: true,
        },
      },
    })),
};
