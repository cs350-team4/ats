import MgmtEditPrize from "./MgmtEditPrize";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Management/MgmtEditPrize",
  component: MgmtEditPrize,
  tags: ["autodocs"],
  args: {
    initialPrize: {
      id: "5555",
      name: "Item Name",
      stock: 1000,
      price: 100,
      description: "Item Description. ",
      image: "https://placehold.jp/3d4070/ffffff/512x357.jpg",
    },
  },
} satisfies Meta<typeof MgmtEditPrize>;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export default meta;
