/** @type {import("eslint").ESLint.ConfigData} */
const config = {
  root: true,
  extends: ["@proto-graphql"],
  parserOptions: {
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
};

module.exports = config;
