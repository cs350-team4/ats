import type React from "react";
import { Center, Flex, Loader, LoadingOverlay, Box, Text } from "@mantine/core";
import { useAuth, UseAuthResult } from "../data/auth";
import {
  useCreateGame,
  useDeleteGame,
  usePatchGame,
  useGameList,
} from "../data/game";
import MgmtGameList from "./MgmtGameList";

/**
 * This ensures that auth is defined (i.e., user is logged in) without breaking type system or react hook rules
 */
const MgmtGameBody: React.FC<{ auth: UseAuthResult }> = ({ auth }) => {
  // setup react hooks
  const {
    data: gameList,
    error: gameListError,
    status: gameListStatus,
  } = useGameList(auth.jwt);
  const {
    mutate: createGame,
    status: createGameStatus,
    error: createGameError,
  } = useCreateGame();
  const {
    mutate: patchGame,
    status: patchGameStatus,
    error: patchGameError,
  } = usePatchGame();
  const {
    mutate: deleteGame,
    status: deleteGameStatus,
    error: deleteGameError,
  } = useDeleteGame();

  // Various loading/error overlays
  if (gameListStatus === "loading") {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  if (gameListStatus === "error") {
    return (
      <Center>
        <Flex mt="md" gap="md" direction="column">
          <Text weight={700}>Error getting the list of tickets.</Text>
          <Text>
            {gameListError instanceof Error
              ? `${gameListError.name}: ${gameListError.message}`
              : "Unknown error"}
          </Text>
        </Flex>
      </Center>
    );
  }

  if (createGameStatus === "error") {
    return (
      <Center>
        <Flex mt="md" gap="md" direction="column">
          <Text weight={700}>Error creating prize.</Text>
          <Text>
            {createGameError instanceof Error
              ? `${createGameError.name}: ${createGameError.message}`
              : "Unknown error"}
          </Text>
        </Flex>
      </Center>
    );
  }

  if (patchGameStatus === "error") {
    return (
      <Center>
        <Flex mt="md" gap="md" direction="column">
          <Text weight={700}>Error updating prize.</Text>
          <Text>
            {patchGameError instanceof Error
              ? `${patchGameError.name}: ${patchGameError.message}`
              : "Unknown error"}
          </Text>
        </Flex>
      </Center>
    );
  }

  if (deleteGameStatus === "error") {
    return (
      <Center>
        <Flex mt="md" gap="md" direction="column">
          <Text weight={700}>Error deleting prize.</Text>
          <Text>
            {deleteGameError instanceof Error
              ? `${deleteGameError.name}: ${deleteGameError.message}`
              : "Unknown error"}
          </Text>
        </Flex>
      </Center>
    );
  }

  return (
    <>
      <Box style={{ position: "relative", height: "max-content" }}>
        <LoadingOverlay
          visible={
            createGameStatus === "loading" ||
            patchGameStatus === "loading" ||
            deleteGameStatus === "loading"
          }
        />
        <MgmtGameList
          games={gameList}
          onChange={(game) => {
            patchGame({ jwt: auth.jwt, game });
          }}
          onAdd={(game) => {
            createGame({ jwt: auth.jwt, game });
          }}
          onRemove={(gameId) => {
            deleteGame({ jwt: auth.jwt, gameId });
          }}
        />
      </Box>
    </>
  );
};

/**
 * Management page for prizes
 */
const MgmtGame: React.FunctionComponent = () => {
  const auth = useAuth();

  if (!auth) {
    return (
      <Center>
        <Text>Not logged in</Text>
      </Center>
    );
  }

  return <MgmtGameBody auth={auth} />;
};

export default MgmtGame;
