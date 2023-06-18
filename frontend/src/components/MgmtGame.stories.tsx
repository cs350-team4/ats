import MgmtGame from "./MgmtGame";
import type { Meta, StoryObj } from "@storybook/react";
import Mocks from "../data/Mocks";

const meta = {
  title: "Management/MgmtGame",
  component: MgmtGame,
  tags: ["autodocs"],
} satisfies Meta<typeof MgmtGame>;
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
