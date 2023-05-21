import KioskPrizeList from "./KioskPrizeList";
import type { Meta, StoryObj } from "@storybook/react";
import { PRIZE_LIST } from "../data/Mocks";

const meta = {
  title: "Kiosk/KioskPrizeList",
  component: KioskPrizeList,
  tags: ["autodocs"],
  args: {
    currentTickets: 250,
    prizes: PRIZE_LIST,
  },
} satisfies Meta<typeof KioskPrizeList>;
type Story = StoryObj<typeof meta>;

export default meta;

export const Default = {} satisfies Story;
