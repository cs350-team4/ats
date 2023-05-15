module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "semistandard",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
  ],
  plugins: ["@typescript-eslint", "prettier"],
  settings: {
    react: {
      version: "detect",
    },
  },
};
