import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  // Ignore build output and cache directories
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**"
    ]
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Add any custom rule overrides here
    },
  },
];

export default eslintConfig;
