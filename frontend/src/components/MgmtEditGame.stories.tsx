import MgmtEditGame from "./MgmtEditGame";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Management/MgmtEditGame",
  component: MgmtEditGame,
  tags: ["autodocs"],
  args: {
    initialGame: {
      id: "5555",
      name: "Item Name",
      exchange_rate: 1.5,
      password: "pwpwpwpwpwpwpwpwpwpwpwpwpwpwpwpw",
    },
  },
} satisfies Meta<typeof MgmtEditGame>;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export default meta;
