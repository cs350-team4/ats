/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
    "storybook-dark-mode",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  typescript: {
    // Overrides the default Typescript configuration to allow multi-package components to be documented via Autodocs.
    reactDocgen: 'react-docgen-typescript',
    skipBabel: true,
    check: false,
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true
    },
  },
};
export default config;
