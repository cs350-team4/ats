import type React from "react";
import {
  Card,
  Image,
  Text,
  Button,
  Modal,
  Container,
  SimpleGrid,
  Group,
  Box,
  Flex,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useRef } from "react";
import type { Prize } from "../data/prize";

export interface KioskPrizeDisplayProps {
  /**
   * The number of tickets the user currently have
   */
  currentTickets: number;
  prize: Prize;
  /**
   * Callback when the user confirms the prize selection
   * @param prizeId prize id of the picked prize
   * @returns none
   */
  onPick: (prizeId: string) => void;
}

/**
 * A component to display individual item.
 */
const KioskPrizeDisplay: React.FC<KioskPrizeDisplayProps> = ({
  currentTickets,
  prize: { id: prizeId, name, stock, price: cost, description, image },
  onPick,
}) => {
  const [confirmOpened, { open: confirmOpen, close: confirmClose }] =
    useDisclosure(false);

  // make image not draggable
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    imageRef.current?.setAttribute("draggable", "false");
  }, []);

  return (
    <>
      {/* Confirmation box */}
      <Modal
        opened={confirmOpened}
        onClose={confirmClose}
        title="Confirm order"
        centered
      >
        <Container size="xs">
          <Text weight={700}>{name}</Text>

          <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs" mt="md">
            <Text>Availiable</Text>
            <Text ta="right">{currentTickets} tickets</Text>
            <Text>Item price</Text>
            <Text ta="right">{cost} tickets</Text>
            <Text>Remaining</Text>
            <Text ta="right">{currentTickets - cost} tickets</Text>
          </SimpleGrid>

          <Group grow>
            <Button color="red" radius="xl" mt="md" onClick={confirmClose}>
              Cancel
            </Button>

            <Button
              color="blue"
              radius="xl"
              mt="md"
              onClick={() => {
                onPick(prizeId);
                confirmClose();
              }}
            >
              Buy
            </Button>
          </Group>
        </Container>
      </Modal>

      {/* The display card */}
      <Card shadow="md" padding="md" radius="md" h="100%" withBorder>
        <Card.Section>
          <Image withPlaceholder src={image} height={200} imageRef={imageRef} />
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

            <Text>{cost} Tickets</Text>

            <Text color="dimmed" lineClamp={3}>
              {description}
            </Text>
          </Flex>

          <Box style={{ flexGrow: 1 }}></Box>

          {stock <= 0 ? (
            <Button fullWidth disabled radius="xl">
              Out of stock
            </Button>
          ) : cost > currentTickets ? (
            <Button fullWidth disabled radius="xl">
              Not enough tickets
            </Button>
          ) : (
            <Button fullWidth radius="xl" onClick={confirmOpen}>
              Buy
            </Button>
          )}
        </Flex>
      </Card>
    </>
  );
};

export default KioskPrizeDisplay;
