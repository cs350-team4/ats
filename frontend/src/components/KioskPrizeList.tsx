import type React from "react";
import {
  Text,
  Container,
  Group,
  Chip,
  NativeSelect,
  Box,
  useMantineTheme,
  Pagination,
  Flex,
} from "@mantine/core";
import KioskPrizeDisplay from "./KioskPrizeDisplay";
import type { Prize } from "../data/prize";
import { useDisclosure } from "@mantine/hooks";
import { useState, useMemo } from "react";
import { PRIZE_LIST_PAGE_LENGTH } from "../global.config";

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

  const filteredPrizes = useMemo(() => {
    let filteredPrizes = prizes;

    // filters
    if (filterInStock) {
      filteredPrizes = filteredPrizes.filter((item) => item.stock > 0);
    }
    if (filterCanAfford) {
      filteredPrizes = filteredPrizes.filter(
        (item) => currentTickets > item.price
      );
    }

    // sorts
    switch (sortOrder) {
      case "Name (A-Z)":
        filteredPrizes.sort((lhs, rhs) => lhs.name.localeCompare(rhs.name));
        break;
      case "Name (Z-A)":
        filteredPrizes.sort((lhs, rhs) => rhs.name.localeCompare(lhs.name));
        break;
      case "Price (Low-High)":
        filteredPrizes.sort((lhs, rhs) => lhs.price - rhs.price);
        break;
      case "Price (High-Low)":
        filteredPrizes.sort((lhs, rhs) => rhs.price - lhs.price);
        break;
    }

    return filteredPrizes;
  }, [sortOrder, filterInStock, filterCanAfford, prizes, currentTickets]);

  // pagination
  const [activePage, setPage] = useState(1);
  const pageCount = Math.ceil(filteredPrizes.length / PRIZE_LIST_PAGE_LENGTH);
  const displayPrizes = filteredPrizes.slice(
    (activePage - 1) * PRIZE_LIST_PAGE_LENGTH,
    activePage * PRIZE_LIST_PAGE_LENGTH
  );

  return (
    <>
      <Container fluid>
        {/* Item filters */}
        <Flex
          m="md"
          gap="md"
          direction="column"
          align="center"
          justify="center"
        >
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

          <Pagination total={pageCount} value={activePage} onChange={setPage} />
        </Flex>

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
              <Box key={prize.id}>
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
