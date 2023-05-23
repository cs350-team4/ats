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

/**
 * List with mixed short/long prize descriptions should display consistently.
 * Along each row should have equal height and no gap should be visible along the column.
 */
export const MixShortLongItems = {
  args: {
    prizes: [
      {
        id: "1",
        name: "Item 1",
        stock: 1000,
        price: 100,
        description: "Item Description. ",
        image: "https://placehold.jp/3d4070/ffffff/512x357.jpg",
      },
      {
        id: "2",
        name: "Item 2",
        stock: 1000,
        price: 200,
        description: `The Vuxxi branded umbrella is a stunning accessory that effortlessly combines functionality with luxury. Crafted with the utmost attention to detail, it exemplifies Vuxxi's timeless elegance and iconic design aesthetic. 
    The umbrella features a sturdy and lightweight construction, ensuring durability and ease of use. Its large canopy provides ample coverage, shielding you from rain or harsh sunlight, while exuding a sense of sophistication. The fabric used is of the highest quality, offering excellent water resistance and UV protection.
    What sets the Vuxxi branded umbrella apart is its exquisite design. The canopy showcases Vuxxi's signature VX logo, intricately woven or printed onto the fabric, instantly recognizable to fashion enthusiasts. The brand's iconic motifs, such as the interlocking G pattern or the vibrant floral prints from the Vuxxi Garden collection, adorn the umbrella, making it a true statement piece.
    The handle of the umbrella is meticulously crafted, featuring luxurious materials like fine leather, polished metal, or even bamboo, depending on the specific design. The attention to detail extends to every aspect, including the smooth opening and closing mechanism, ensuring effortless operation.
    Whether shielding you from the elements or simply adding a touch of opulence to your outfit, the Vuxxi branded umbrella is the epitome of refined style. It is a must-have accessory for those who appreciate the fusion of functionality and high fashion.`,
        image: "https://placehold.jp/3d4070/ffffff/512x357.jpg",
      },
      {
        id: "3",
        name: "Item 3",
        stock: 1000,
        price: 300,
        description: "Item Description. ",
        image: "https://placehold.jp/3d4070/ffffff/512x357.jpg",
      },
      {
        id: "4",
        name: "Item 4",
        stock: 1000,
        price: 400,
        description: "Item Description. ",
        image: "https://placehold.jp/3d4070/ffffff/512x357.jpg",
      },
    ],
  },
} satisfies Story;
