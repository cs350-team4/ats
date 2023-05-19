module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  extends: [
    "eslint:recommended",
    "semistandard",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended",
    "plugin:storybook/recommended",
  ],
  plugins: ["@typescript-eslint", "prettier"],
  settings: {
    react: {
      version: "detect",
    },
  },
};
