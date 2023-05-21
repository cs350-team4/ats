import type React from "react";
import {
  Text,
  Container,
  Group,
  Chip,
  NativeSelect,
  Center,
  Box,
  useMantineTheme,
} from "@mantine/core";
import KioskPrizeDisplay from "./KioskPrizeDisplay";
import type { Prize } from "../data/prize";
import { useDisclosure } from "@mantine/hooks";
import { useState, useMemo } from "react";

export interface KioskPrizeListProps {
  /**
   * The number of tickets the user currently have
   */
  currentTickets: number;
  /**
   * Full list of all prizes
   */
  prizes: Prize[];
  /**
   * Callback when the user confirms the prize selection
   * @param prizeId prize id of the picked prize
   * @returns none
   */
  onPick: (prizeId: string) => void;
}

const SortOrder = [
  "Name (A-Z)",
  "Name (Z-A)",
  "Price (Low-High)",
  "Price (High-Low)",
] as const;
type SortOrderT = (typeof SortOrder)[number];
const SortOrderV = SortOrder as unknown as string[];

/**
 * A component to list of prize items. Allows for basic filtering and sorting
 */
const KioskPrizeList: React.FC<KioskPrizeListProps> = ({
  currentTickets,
  prizes,
  onPick,
}) => {
  const theme = useMantineTheme();

  const [filterInStock, { toggle: toggleFilterInStock }] = useDisclosure(false);
  const [filterCanAfford, { toggle: toggleFilterCanAfford }] =
    useDisclosure(false);
  const [sortOrder, setSortOrder] = useState<SortOrderT>(SortOrder[0]);

  const displayPrizes = useMemo(() => {
    let displayPrizes = prizes;

    // filters
    if (filterInStock) {
      displayPrizes = displayPrizes.filter((item) => item.stock > 0);
    }
    if (filterCanAfford) {
      displayPrizes = displayPrizes.filter(
        (item) => currentTickets > item.cost
      );
    }

    // sorts
    displayPrizes.sort((lhs, rhs) => {
      switch (sortOrder) {
        case "Name (A-Z)":
          return lhs.name.localeCompare(rhs.name);
        case "Name (Z-A)":
          return rhs.name.localeCompare(lhs.name);
        case "Price (Low-High)":
          return lhs.cost === rhs.cost ? 0 : lhs.cost < rhs.cost ? -1 : 1;
        case "Price (High-Low)":
          return rhs.cost === lhs.cost ? 0 : rhs.cost < lhs.cost ? -1 : 1;
        default:
          return 0;
      }
    });
    return displayPrizes;
  }, [sortOrder, filterInStock, filterCanAfford, prizes, currentTickets]);

  return (
    <>
      <Container size="lg">
        {/* Item filters */}
        <Center mb="md">
          <Group>
            <NativeSelect
              data={SortOrderV}
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(event.currentTarget.value as SortOrderT)
              }
            />
            <Chip variant="filled" onClick={toggleFilterCanAfford}>
              Affortable Only
            </Chip>
            <Chip variant="filled" onClick={toggleFilterInStock}>
              In Stock Only
            </Chip>
          </Group>
        </Center>

        {displayPrizes.length === 0 ? (
          // List is empty
          <Text>No prizes found</Text>
        ) : (
          // List is not empty
          <Box
            style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, 340px)",
              justifyContent: "center",
              gap: theme.spacing.sm,
            }}
          >
            {displayPrizes.map((prize) => (
              <Box key={prize.prizeId}>
                <KioskPrizeDisplay
                  prize={prize}
                  currentTickets={currentTickets}
                  onPick={onPick}
                />
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </>
  );
};

export default KioskPrizeList;
