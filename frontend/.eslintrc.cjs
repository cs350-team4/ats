module.exports = {
  extends: [
    "eslint:recommended",
    "semistandard",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
  ],
  // parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
};
