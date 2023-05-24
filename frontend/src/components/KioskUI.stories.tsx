import Mocks from "../data/Mocks";
import KioskUI from "./KioskUI";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Kiosk/KioskUI",
  component: KioskUI,
  tags: ["autodocs"],
} satisfies Meta<typeof KioskUI>;
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
