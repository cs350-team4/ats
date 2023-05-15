import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useDarkMode } from "storybook-dark-mode";
import { theme } from "../src/components/theme";
import React from "react";
import type { Parameters } from "@storybook/react";

// Create a wrapper component that will contain all your providers.
// Usually you should render all providers in this component:
// MantineProvider, DatesProvider, Notifications, Spotlight, etc.
function ThemeWrapper(props: { children: React.ReactNode }) {
  const colorScheme = useDarkMode() ? "dark" : "light";

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={() => {}}>
      <MantineProvider
        theme={{ ...theme, colorScheme }}
        withGlobalStyles
        withNormalizeCSS
      >
        {props.children}
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

// enhance your stories with decorator that uses ThemeWrapper
export const decorators = [
  (renderStory: Function) => <ThemeWrapper>{renderStory()}</ThemeWrapper>,
];

export const parameters: Parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  darkMode: {
    // Set the initial theme
    current: "light",
  },
};
