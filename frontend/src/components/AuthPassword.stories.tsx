import AuthPassword from "./AuthPassword";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Auth/AuthPassword",
  component: AuthPassword,
  tags: ["autodocs"],
} satisfies Meta<typeof AuthPassword>;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export default meta;
