import Mocks from "../data/Mocks";
import MgmtUI from "./MgmtUI";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Management/MgmtUI",
  component: MgmtUI,
  tags: ["autodocs"],
} satisfies Meta<typeof MgmtUI>;
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
