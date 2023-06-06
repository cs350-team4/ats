import type React from "react";
import { Center, Flex, Loader, LoadingOverlay, Box, Text } from "@mantine/core";
import { useAuth, UseAuthResult } from "../data/auth";
import {
  useCreatePrize,
  useDeletePrize,
  usePatchPrize,
  usePrizeList,
} from "../data/prize";
import MgmtPrizeList from "./MgmtPrizeList";

/**
 * This ensures that auth is defined (i.e., user is logged in) without breaking type system or react hook rules
 */
const MgmtPrizeBody: React.FC<{ auth: UseAuthResult }> = ({ auth }) => {
  // setup react hooks
  const {
    data: prizeList,
    error: prizeListError,
    status: prizeListStatus,
  } = usePrizeList();
  const {
    mutate: createPrize,
    status: createPrizeStatus,
    error: createPrizeError,
  } = useCreatePrize();
  const {
    mutate: patchPrize,
    status: patchPrizeStatus,
    error: patchPrizeError,
  } = usePatchPrize();
  const {
    mutate: deletePrize,
    status: deletePrizeStatus,
    error: deletePrizeError,
  } = useDeletePrize();

  // Various loading/error overlays
  if (prizeListStatus === "loading") {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  if (prizeListStatus === "error") {
    return (
      <Center>
        <Flex mt="md" gap="md" direction="column">
          <Text weight={700}>Error getting the list of tickets.</Text>
          <Text>
            {prizeListError instanceof Error
              ? `${prizeListError.name}: ${prizeListError.message}`
              : "Unknown error"}
          </Text>
        </Flex>
      </Center>
    );
  }

  if (createPrizeStatus === "error") {
    return (
      <Center>
        <Flex mt="md" gap="md" direction="column">
          <Text weight={700}>Error creating prize.</Text>
          <Text>
            {createPrizeError instanceof Error
              ? `${createPrizeError.name}: ${createPrizeError.message}`
              : "Unknown error"}
          </Text>
        </Flex>
      </Center>
    );
  }

  if (patchPrizeStatus === "error") {
    return (
      <Center>
        <Flex mt="md" gap="md" direction="column">
          <Text weight={700}>Error updating prize.</Text>
          <Text>
            {patchPrizeError instanceof Error
              ? `${patchPrizeError.name}: ${patchPrizeError.message}`
              : "Unknown error"}
          </Text>
        </Flex>
      </Center>
    );
  }

  if (deletePrizeStatus === "error") {
    return (
      <Center>
        <Flex mt="md" gap="md" direction="column">
          <Text weight={700}>Error deleting prize.</Text>
          <Text>
            {deletePrizeError instanceof Error
              ? `${deletePrizeError.name}: ${deletePrizeError.message}`
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
            createPrizeStatus === "loading" ||
            patchPrizeStatus === "loading" ||
            deletePrizeStatus === "loading"
          }
        />
        <MgmtPrizeList
          prizes={prizeList}
          onChange={(prize) => {
            patchPrize({ jwt: auth.jwt, prize });
          }}
          onAdd={(prize) => {
            createPrize({ jwt: auth.jwt, prize });
          }}
          onRemove={(prizeId) => {
            deletePrize({ jwt: auth.jwt, prizeId });
          }}
        />
      </Box>
    </>
  );
};

/**
 * Management page for prizes
 */
const MgmtPrize: React.FunctionComponent = () => {
  const auth = useAuth();

  if (!auth) {
    return (
      <Center>
        <Text>Not logged in</Text>
      </Center>
    );
  }

  return <MgmtPrizeBody auth={auth} />;
};

export default MgmtPrize;
