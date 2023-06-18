import Mocks from "../data/Mocks";
import MgmtCoupon from "./MgmtCoupon";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Management/MgmtCoupon",
  component: MgmtCoupon,
  tags: ["autodocs"],
} satisfies Meta<typeof MgmtCoupon>;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export default meta;

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
