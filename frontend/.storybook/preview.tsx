import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useDarkMode } from "storybook-dark-mode";
import { theme } from "../src/components/theme";
import React from "react";
import type { Parameters, Decorator } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initialize, mswDecorator } from "msw-storybook-addon";

// Create a wrapper component that will contain all your providers.
// Usually you should render all providers in this component:
// MantineProvider, DatesProvider, Notifications, Spotlight, etc.
const MantineWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const colorScheme = useDarkMode() ? "dark" : "light";

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={() => {}}>
      <MantineProvider
        theme={{ ...theme, colorScheme }}
        withGlobalStyles
        withNormalizeCSS
      >
        {children}
      </MantineProvider>
    </ColorSchemeProvider>
  );
};

const queryClient = new QueryClient();

const QueryClientWrapper: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Initialize MSW
initialize();

export const decorators = [
  (Story) => (
    <MantineWrapper>
      <Story />
    </MantineWrapper>
  ),
  (Story) => (
    <QueryClientWrapper>
      <Story />
    </QueryClientWrapper>
  ),
  mswDecorator,
] satisfies Decorator[];

export const parameters = {
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
} satisfies Parameters;
