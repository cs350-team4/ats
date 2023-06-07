import type { MantineThemeOverride } from "@mantine/core";

export const theme: MantineThemeOverride = {
  components: {
    Button: {
      defaultProps: {
        radius: "xl",
      },
    },
  },
};
