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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useRef } from "react";

export interface KioskPrizeDisplayProps {
  prizeId: string;
  name: string;
  stock: number;
  cost: number;
  /**
   * The number of tickets the user currently have
   */
  currentTickets: number;
  description: string;
  /**
   * Image source is a url (including base64-encoded data url, https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs)
   * Note: image is scaled to cover the space
   */
  image: string;
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
  prizeId,
  name,
  stock,
  cost,
  currentTickets,
  description,
  image,
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
      <Card shadow="md" padding="md" radius="md" withBorder>
        <Card.Section>
          <Image withPlaceholder src={image} height={200} imageRef={imageRef} />
        </Card.Section>

        <Text weight={700} lineClamp={1} mt="md">
          {name}
        </Text>

        <Text mt="xs">{cost} Tickets</Text>

        <Text color="dimmed" mt="xs" lineClamp={3}>
          {description}
        </Text>

        {stock <= 0 ? (
          <Button fullWidth disabled mt="md" radius="xl">
            Out of stock
          </Button>
        ) : cost > currentTickets ? (
          <Button fullWidth disabled mt="md" radius="xl">
            Not enough tickets
          </Button>
        ) : (
          <Button fullWidth mt="md" radius="xl" onClick={confirmOpen}>
            Buy
          </Button>
        )}
      </Card>
    </>
  );
};

export default KioskPrizeDisplay;
