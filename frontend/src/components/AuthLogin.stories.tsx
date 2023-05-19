import AuthLogin from "./AuthLogin";
import type { Meta, StoryObj } from "@storybook/react";
import Mocks from "../data/Mocks";

const meta = {
  title: "Auth/AuthLogin",
  component: AuthLogin,
  tags: ["autodocs"],
  parameters: {
    msw: {
      handlers: Mocks,
    },
  },
} satisfies Meta<typeof AuthLogin>;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export default meta;
