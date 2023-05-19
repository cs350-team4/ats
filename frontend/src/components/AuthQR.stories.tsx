import AuthQR from "./AuthQR";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Auth/AuthQR",
  component: AuthQR,
  tags: ["autodocs"],
} satisfies Meta<typeof AuthQR>;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export default meta;
