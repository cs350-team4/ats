import type React from "react";
import {
  Button,
  Container,
  Group,
  TextInput,
  NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Game } from "../data/game";

export interface MgmtEditGameProps {
  initialGame: Game;
  /**
   * Callback with the changed prizes
   * @param prize the new prize
   * @returns none
   */
  onSave: (game: Game) => void;
  /**
   * Callback when canceled
   * @returns none
   */
  onCancel: () => void;
}

/**
 * A form to edit prize. Intended to be put inside a modal. For both new item or edit existing item
 */
const MgmtEditGame: React.FC<MgmtEditGameProps> = ({
  initialGame /*: { id: gameId, name, exchangeRate, password } */,
  onSave,
  onCancel,
}) => {
  const form = useForm({
    initialValues: {
      name: initialGame.name,
      password: initialGame.password,
      exchangeRate: initialGame.exchangeRate,
    },

    validate: {
      password: (value) =>
        !(typeof value === "string")
          ? "Password Must be string"
          : value.length !== 32
          ? "Password Must be 32 characters"
          : null,
      exchangeRate: (value) =>
        !(typeof value === "number" && isFinite(value))
          ? "Exchange rate isn't a number"
          : value < 0.0
          ? "Exchange rate is negative"
          : null,
    },
  });

  const onSubmit = form.onSubmit((values) => {
    onSave({ ...values, id: initialGame.id });
  });

  return (
    <>
      <Container size="xs">
        <form onSubmit={onSubmit}>
          <TextInput label="Name" {...form.getInputProps("name")} />
          <NumberInput
            label="Exchange rate"
            min={0.0}
            precision={2}
            {...form.getInputProps("exchangeRate")}
          />
          <TextInput label="Password" {...form.getInputProps("password")} />

          <Group grow mt="md">
            <Button color="red" radius="xl" onClick={onCancel}>
              Cancel
            </Button>

            <Button color="blue" radius="xl" type="submit">
              Save
            </Button>
          </Group>
        </form>
      </Container>
    </>
  );
};

export default MgmtEditGame;
