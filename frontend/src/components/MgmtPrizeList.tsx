import type React from "react";
import {
  Text,
  Container,
  Group,
  Image,
  NativeSelect,
  Box,
  useMantineTheme,
  Pagination,
  Flex,
  Center,
  Card,
  Modal,
  Button,
} from "@mantine/core";
import type { Prize } from "../data/prize";
import { useState, useMemo } from "react";
import { PRIZE_LIST_PAGE_LENGTH } from "../global.config";
import MgmtEditPrize from "./MgmtEditPrize";

export interface MgmtPrizeDisplayProps {
  prize: Prize;
  /**
   * Callback when the user select the prize to edit
   * @param prizeId prize id of the selected prize
   * @returns none
   */
  onEdit: (prizeId: string) => void;
  /**
   * Callback when the user select the prize to remove
   * @param prizeId prize id of the selected prize
   * @returns none
   */
  onRemove: (prizeId: string) => void;
}

/**
 * A component to display individual item.
 */
const MgmtPrizeDisplay: React.FC<MgmtPrizeDisplayProps> = ({
  prize: { id: prizeId, name, stock, price, description, image },
  onEdit,
  onRemove,
}) => {
  return (
    <>
      {/* The display card */}
      <Card shadow="md" padding="md" radius="md" h="100%" withBorder>
        <Card.Section>
          <Image withPlaceholder src={image} height={200} />
        </Card.Section>

        <Flex
          mt="md"
          gap="md"
          direction="column"
          wrap="nowrap"
          h="calc(100% - 200px)"
        >
          <Flex gap="xs" direction="column" wrap="nowrap">
            <Text weight={700} lineClamp={1}>
              {name}
            </Text>

            <Text>Price: {price} Tickets</Text>
            <Text>Stock: {stock} Remains</Text>

            <Text color="dimmed" lineClamp={3}>
              {description}
            </Text>
          </Flex>

          <Box style={{ flexGrow: 1 }}></Box>

          <Group grow>
            <Button radius="xl" color="red" onClick={() => onRemove(prizeId)}>
              Remove
            </Button>
            <Button radius="xl" onClick={() => onEdit(prizeId)}>
              Edit
            </Button>
          </Group>
        </Flex>
      </Card>
    </>
  );
};

export interface MgmtPrizeListProps {
  /**
   * Full list of all prizes
   */
  prizes: Prize[];
  /**
   * Callback with the changed prizes
   * @param prize the new prize
   * @returns none
   */
  onChange: (prize: Prize) => void;
  /**
   * Callback when a prize is added
   * @param prize the new prize
   * @returns none
   */
  onAdd: (prize: Prize) => void;
  /**
   * Callback when a prize is removed
   * @param prizeId prize id of the removed prize
   * @returns none
   */
  onRemove: (prizeId: string) => void;
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
 * A component to list of prize items. Allows for basic sorting
 */
const MgmtPrizeList: React.FC<MgmtPrizeListProps> = ({
  prizes,
  onChange,
  onAdd,
  onRemove,
}) => {
  const theme = useMantineTheme();

  const [sortOrder, setSortOrder] = useState<SortOrderT>(SortOrder[0]);

  const filteredPrizes = useMemo(() => {
    const filteredPrizes = prizes;

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
  }, [sortOrder, prizes]);

  // pagination
  const [activePage, setPage] = useState(1);
  const pageCount = Math.ceil(filteredPrizes.length / PRIZE_LIST_PAGE_LENGTH);
  const displayPrizes = filteredPrizes.slice(
    (activePage - 1) * PRIZE_LIST_PAGE_LENGTH,
    activePage * PRIZE_LIST_PAGE_LENGTH
  );

  if (pageCount > 0 && activePage > pageCount) {
    setPage(pageCount);
  }

  const [isNewItem, setIsNewItem] = useState(true);
  const [targetItem, setTargetItem] = useState<Prize>();

  const onEditClick = (prizeId: string) => {
    setIsNewItem(false);
    setTargetItem(prizes.find((prize) => prize.id === prizeId));
  };

  const onAddClick = () => {
    setIsNewItem(true);
    // This is the default value for adding new item
    setTargetItem({
      id: "-1",
      name: "",
      description: "",
      stock: 0,
      price: 0,
      image: "",
    });
  };

  return (
    <>
      {/* Edit form */}
      <Modal
        opened={!!targetItem}
        onClose={() => {
          setTargetItem(undefined);
        }}
        title={isNewItem ? "Add Item" : "Edit Item"}
        transitionProps={undefined}
        centered
      >
        {targetItem && (
          <MgmtEditPrize
            initialPrize={targetItem}
            onCancel={() => {
              setTargetItem(undefined);
            }}
            onSave={(prize) => {
              if (isNewItem) {
                onAdd(prize);
              } else {
                onChange(prize);
              }
              setTargetItem(undefined);
            }}
          />
        )}
      </Modal>

      {/* Item list */}
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
            <Button radius="xl" onClick={onAddClick}>
              Add Prize
            </Button>
          </Group>

          <Pagination total={pageCount} value={activePage} onChange={setPage} />
        </Flex>

        {displayPrizes.length === 0 ? (
          // List is empty
          <Center>
            <Text>No prizes found</Text>
          </Center>
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
                <MgmtPrizeDisplay
                  prize={prize}
                  onEdit={onEditClick}
                  onRemove={onRemove}
                />
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </>
  );
};

export default MgmtPrizeList;
