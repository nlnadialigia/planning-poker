import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  { files: ["src/**/*.{ts,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      pluginReact,
    },
  },
  {
    rules: {
      quotes: ["error", "double"],
      "max-len": [1, { code: 120, ignoreUrls: true, ignoreStrings: true }],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-inline-comments": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/triple-slash-reference": "warn",
    },
  },
  {
    ignores: [
      "src/styles/**/*",
      "tailwind.config.ts",
      "postcss.config.js",
      "next.config.js",
      ".next/**/*",
      "old.js",
    ],
  },
];
