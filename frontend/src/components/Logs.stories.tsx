import Mocks from "../data/Mocks";
import Logs from "./Logs";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Management/Logs",
  component: Logs,
  tags: ["autodocs"],
} satisfies Meta<typeof Logs>;
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
