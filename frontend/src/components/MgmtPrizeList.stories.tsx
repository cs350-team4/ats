import MgmtPrizeList from "./MgmtPrizeList";
import type { Meta, StoryObj } from "@storybook/react";
import { PRIZE_LIST } from "../data/Mocks";

const meta = {
  title: "Management/MgmtPrizeList",
  component: MgmtPrizeList,
  tags: ["autodocs"],
  args: {
    prizes: PRIZE_LIST,
  },
} satisfies Meta<typeof MgmtPrizeList>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Default = {} satisfies Story;
