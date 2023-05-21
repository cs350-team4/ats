import KioskPrizeDisplay from "./KioskPrizeDisplay";
import type React from "react";
import { Container } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Kiosk/KioskPrizeDisplay",
  component: KioskPrizeDisplay,
  tags: ["autodocs"],
  args: {
    prize: {
      prizeId: "5555",
      name: "Item Name",
      stock: 1000,
      cost: 100,
      description: "Item Description. ",
      image: "https://placehold.jp/3d4070/ffffff/512x357.jpg",
    },
    currentTickets: 5000,
  },
  decorators: [
    (Story) => (
      <Container maw={300}>
        <Story />
      </Container>
    ),
  ],
} satisfies Meta<typeof KioskPrizeDisplay>;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const OutOfStock = {
  args: {
    prize: {
      prizeId: "5555",
      name: "Item Name",
      stock: 0,
      cost: 100,
      description: "Item Description. ",
      image: "https://placehold.jp/3d4070/ffffff/512x357.jpg",
    },
  },
} satisfies Story;

export const NoTickets = {
  args: {
    currentTickets: 0,
  },
} satisfies Story;

/**
 * Long name and description is limited to 1 and 3 lines respectively. Full name is displayed once the user clicked buy. Yes, all of these information is LLM generated.
 */
export const LongNameAndDescription = {
  args: {
    prize: {
      prizeId: "5555",
      name: "Vuxxi™ Exquisite Umbrella - Summer 2023 Limited Collection Edition by Alessandro Michele",
      stock: 1000,
      cost: 100,
      description: `The Vuxxi branded umbrella is a stunning accessory that effortlessly combines functionality with luxury. Crafted with the utmost attention to detail, it exemplifies Vuxxi's timeless elegance and iconic design aesthetic. 
  The umbrella features a sturdy and lightweight construction, ensuring durability and ease of use. Its large canopy provides ample coverage, shielding you from rain or harsh sunlight, while exuding a sense of sophistication. The fabric used is of the highest quality, offering excellent water resistance and UV protection.
  What sets the Vuxxi branded umbrella apart is its exquisite design. The canopy showcases Vuxxi's signature VX logo, intricately woven or printed onto the fabric, instantly recognizable to fashion enthusiasts. The brand's iconic motifs, such as the interlocking G pattern or the vibrant floral prints from the Vuxxi Garden collection, adorn the umbrella, making it a true statement piece.
  The handle of the umbrella is meticulously crafted, featuring luxurious materials like fine leather, polished metal, or even bamboo, depending on the specific design. The attention to detail extends to every aspect, including the smooth opening and closing mechanism, ensuring effortless operation.
  Whether shielding you from the elements or simply adding a touch of opulence to your outfit, the Vuxxi branded umbrella is the epitome of refined style. It is a must-have accessory for those who appreciate the fusion of functionality and high fashion.`,
      image: "https://placehold.jp/3d4070/ffffff/512x357.jpg",
    },
  },
} satisfies Story;

export default meta;
