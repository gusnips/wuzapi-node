import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

// No em dash in the text readers see: error messages and any string in src/. Comments are
// not nodes, so they stay free. README, CHANGELOG and package.json are covered by
// scripts/check-no-em-dash.ts. The unicode escape keeps the character out of this file.
const NO_EM_DASH = ["Literal[value=/\\u2014/]", "TemplateElement[value.cooked=/\\u2014/]"].map(
  (selector) => ({
    selector,
    message: "No em dash in user-facing text. Use a period, comma, colon or parentheses.",
  }),
);

export default [
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescript.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/consistent-type-imports": "off",
      "prefer-const": "error",
      "no-var": "error",
      "no-restricted-syntax": ["error", ...NO_EM_DASH],
    },
  },
  {
    files: ["vite.config.ts", "eslint.config.mjs"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
      globals: {
        __dirname: "readonly",
        process: "readonly",
        global: "readonly",
        Buffer: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescript.configs.recommended.rules,
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
