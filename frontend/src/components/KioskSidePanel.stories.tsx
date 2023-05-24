import { AppShell, Navbar } from "@mantine/core";
import Mocks from "../data/Mocks";
import KioskSidePanel from "./KioskSidePanel";
import type { Meta, StoryObj } from "@storybook/react";
import type React from "react";

const meta = {
  title: "Kiosk/KioskSidePanel",
  component: KioskSidePanel,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <>
        <AppShell
          padding="md"
          navbar={
            <Navbar width={{ base: 300 }} height="100%" p="md">
              <Story />
            </Navbar>
          }
        >
          <></>
        </AppShell>
      </>
    ),
  ],
} satisfies Meta<typeof KioskSidePanel>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Default = {} satisfies Story;

/**
 * Using mocked backend
 */
export const MockBackend = {
  parameters: {
    msw: {
      handlers: Mocks,
    },
  },
} satisfies Story;
