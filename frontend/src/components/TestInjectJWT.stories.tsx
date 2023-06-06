import TestInjectJWT from "./TestInjectJWT";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Test/TestInjectJWT",
  component: TestInjectJWT,
  tags: ["autodocs"],
} satisfies Meta<typeof TestInjectJWT>;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export default meta;
