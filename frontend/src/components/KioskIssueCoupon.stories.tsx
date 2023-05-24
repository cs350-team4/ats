import Mocks from "../data/Mocks";
import KioskIssueCoupon from "./KioskIssueCoupon";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Kiosk/KioskIssueCoupon",
  component: KioskIssueCoupon,
  tags: ["autodocs"],
} satisfies Meta<typeof KioskIssueCoupon>;
type Story = StoryObj<typeof meta>;

export default meta;

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
