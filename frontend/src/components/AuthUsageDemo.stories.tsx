import Mocks from "../data/Mocks";
import AuthUsageDemo from "./AuthUsageDemo";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Auth/AuthUsageDemo",
  component: AuthUsageDemo,
  tags: ["autodocs"],
  parameters: {
    msw: {
      handlers: Mocks,
    },
  },
} satisfies Meta<typeof AuthUsageDemo>;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export default meta;
