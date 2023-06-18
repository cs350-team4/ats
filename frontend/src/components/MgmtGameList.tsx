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
import type { Game } from "../data/game";
import { useState, useMemo } from "react";
import { GAME_LIST_PAGE_LENGTH } from "../global.config";
import MgmtEditGame from "./MgmtEditGame";

export interface MgmtGameDisplayProps {
  game: Game;
  /**
   * Callback when the user select the game to edit
   * @param gameId game id of the selected game
   * @returns none
   */
  onEdit: (gameId: string) => void;
  /**
   * Callback when the user select the game to remove
   * @param gameId game id of the selected game
   * @returns none
   */
  onRemove: (gameId: string) => void;
}

/**
 * A component to display individual item.
 */
const MgmtGameDisplay: React.FC<MgmtGameDisplayProps> = ({
  game: { id: gameId, name, password, exchange_rate },
  onEdit,
  onRemove,
}) => {
  return (
    <>
      {/* The display card */}
      <Card shadow="md" padding="md" radius="md" h="100%" withBorder>

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

            <Text>Exchange rate: {exchange_rate}</Text>
            <Text>Password: ***</Text>
          </Flex>

          <Box style={{ flexGrow: 1 }}></Box>

          <Group grow>
            <Button radius="xl" color="red" onClick={() => onRemove(gameId)}>
              Remove
            </Button>
            <Button radius="xl" onClick={() => onEdit(gameId)}>
              Edit
            </Button>
          </Group>
        </Flex>
      </Card>
    </>
  );
};

export interface MgmtGameListProps {
  /**
   * Full list of all games
   */
  games: Game[];
  /**
   * Callback with the changed games
   * @param game the new game
   * @returns none
   */
  onChange: (game: Game) => void;
  /**
   * Callback when a game is added
   * @param gaame the new game
   * @returns none
   */
  onAdd: (game: Game) => void;
  /**
   * Callback when a game is removed
   * @param gameId game id of the removed game
   * @returns none
   */
  onRemove: (gameId: string) => void;
}

const SortOrder = [
  "Name (A-Z)",
  "Name (Z-A)",
  "Excahnge Rate (Low-High)",
  "Exchange Rate (High-Low)",
] as const;
type SortOrderT = (typeof SortOrder)[number];
const SortOrderV = SortOrder as unknown as string[];

/**
 * A component to list of game items. Allows for basic sorting
 */
const MgmtGameList: React.FC<MgmtGameListProps> = ({
  games,
  onChange,
  onAdd,
  onRemove,
}) => {
  const theme = useMantineTheme();

  const [sortOrder, setSortOrder] = useState<SortOrderT>(SortOrder[0]);

  const filteredGames = useMemo(() => {
    const filteredGames = games;

    // sorts
    switch (sortOrder) {
      case "Name (A-Z)":
        filteredGames.sort((lhs, rhs) => lhs.name.localeCompare(rhs.name));
        break;
      case "Name (Z-A)":
        filteredGames.sort((lhs, rhs) => rhs.name.localeCompare(lhs.name));
        break;
      case "Excahnge Rate (Low-High)":
        filteredGames.sort((lhs, rhs) => lhs.exchange_rate - rhs.exchange_rate);
        break;
      case "Exchange Rate (High-Low)":
        filteredGames.sort((lhs, rhs) => rhs.exchange_rate - lhs.exchange_rate);
        break;
    }

    return filteredGames;
  }, [sortOrder, games]);

  // pagination
  const [activePage, setPage] = useState(1);
  const pageCount = Math.ceil(filteredGames.length / GAME_LIST_PAGE_LENGTH);
  const displayGames = filteredGames.slice(
    (activePage - 1) * GAME_LIST_PAGE_LENGTH,
    activePage * GAME_LIST_PAGE_LENGTH
  );

  if (pageCount > 0 && activePage > pageCount) {
    setPage(pageCount);
  }

  const [isNewItem, setIsNewItem] = useState(true);
  const [targetItem, setTargetItem] = useState<Game>();

  const onEditClick = (gameId: string) => {
    setIsNewItem(false);
    setTargetItem(games.find((game) => game.id === gameId));
  };

  const onAddClick = () => {
    setIsNewItem(true);
    // This is the default value for adding new item
    setTargetItem({
      id: "-1",
      name: "",
      exchange_rate: 0.0,
      password: "",
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
          <MgmtEditGame
            initialGame={targetItem}
            onCancel={() => {
              setTargetItem(undefined);
            }}
            onSave={(game) => {
              if (isNewItem) {
                onAdd(game);
              } else {
                onChange(game);
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
              Add Game
            </Button>
          </Group>

          <Pagination total={pageCount} value={activePage} onChange={setPage} />
        </Flex>

        {displayGames.length === 0 ? (
          // List is empty
          <Center>
            <Text>No Games found</Text>
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
            {displayGames.map((game) => (
              <Box key={game.id}>
                <MgmtGameDisplay
                  game={game}
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

export default MgmtGameList;
