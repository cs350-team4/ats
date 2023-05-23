import AuthLogin from "./AuthLogin";
import type { Meta, StoryObj } from "@storybook/react";
import Mocks from "../data/Mocks";

const meta = {
  title: "Auth/AuthLogin",
  component: AuthLogin,
  tags: ["autodocs"],
} satisfies Meta<typeof AuthLogin>;
type Story = StoryObj<typeof meta>;

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

export default meta;
