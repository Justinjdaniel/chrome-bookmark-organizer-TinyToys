import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  // Ignore build output and cache directories
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**"
    ]
  },
  ...nextCoreWebVitals,
  {
    rules: {
      // Add any custom rule overrides here
    },
  },
];

export default eslintConfig;
