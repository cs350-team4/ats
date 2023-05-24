import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { theme } from "./theme";
import type React from "react";

const queryClient = new QueryClient();

/**
 * A utility component at the root of React tree
 */
const GlobalWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      <MantineProvider
        theme={{ ...theme, colorScheme: "light" }}
        withGlobalStyles
        withNormalizeCSS
      >
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </MantineProvider>
    </>
  );
};

export default GlobalWrapper;
