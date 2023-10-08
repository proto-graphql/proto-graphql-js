/** @type {import("eslint").ESLint.ConfigData} */
const config = {
  parser: "@typescript-eslint/parser",
  ignorePatterns: [
    "**/__generated__/**",
    "**/coverage/**",
    "**/lib/**",
    "**/module/**",
    "**/tmp/**",
  ],
  env: {
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/stylistic",
    "prettier",
    // 'plugin:import/recommended', // use only `import/order`
    // 'plugin:import/typescript', // Not necessary for `import/order` use only
  ],
  plugins: ["@typescript-eslint", "import", "unused-imports"],
  rules: {
    // eslint: recommended rules
    "no-undef": "off",

    // eslint: additional rules
    "prefer-const": "error",
    eqeqeq: ["error", "smart"],
    "no-console": "error",
    "no-restricted-syntax": [
      "error",
      {
        selector: "TSEnumDeclaration",
        message:
          "Don't use TypeScript enums. Use object literal with `as const` instead. See https://typescriptbook.jp/reference/values-types-variables/enum/enum-problems-and-alternatives-to-enums",
      },
    ],

    // typescript-eslint: recommended rules
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
    // TODO: Change to "error" when all warnings are resolved
    "@typescript-eslint/no-explicit-any": "off",

    // typescript-eslint: additional rules
    "@typescript-eslint/explicit-member-accessibility": [
      "error",
      {
        overrides: {
          constructors: "no-public",
          parameterProperties: "no-public",
          accessors: "no-public",
        },
      },
    ],
    "@typescript-eslint/no-redeclare": "error",

    // import
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          ["internal", "parent", "sibling", "index"],
          "object",
          "type",
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
        },
      },
    ],

    // unused-imports
    "unused-imports/no-unused-imports": "error",
  },
  reportUnusedDisableDirectives: true,
  overrides: [
    {
      files: ["{test,__test__}/**", "**/*.{spec,test}.{,m,c}{j,t}s{,x}"],
      plugins: ["jest"],
      env: {
        jest: true,
        "jest/globals": true,
      },
      extends: ["plugin:jest/recommended"],
    },
  ],
};

module.exports = config;
