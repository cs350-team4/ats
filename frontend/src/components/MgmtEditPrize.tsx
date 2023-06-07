import type React from "react";
import {
  Image,
  Text,
  Button,
  Container,
  Group,
  TextInput,
  NumberInput,
  FileInput,
  Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Prize } from "../data/prize";

export interface MgmtEditPrizeProps {
  initialPrize: Prize;
  /**
   * Callback with the changed prizes
   * @param prize the new prize
   * @returns none
   */
  onSave: (prize: Prize) => void;
  /**
   * Callback when canceled
   * @returns none
   */
  onCancel: () => void;
}

/**
 * A form to edit prize. Intended to be put inside a modal. For both new item or edit existing item
 */
const MgmtEditPrize: React.FC<MgmtEditPrizeProps> = ({
  initialPrize /*: { id: prizeId, name, stock, price, description, image } */,
  onSave,
  onCancel,
}) => {
  const form = useForm({
    initialValues: {
      name: initialPrize.name,
      stock: initialPrize.stock,
      price: initialPrize.price,
      description: initialPrize.description,
      image: initialPrize.image,
    },

    validate: {
      stock: (value) =>
        !(typeof value === "number" && isFinite(value))
          ? "Stock isn't a number"
          : value < 0
          ? "Stock is negative"
          : null,
      price: (value) =>
        !(typeof value === "number" && isFinite(value))
          ? "Price isn't a number"
          : value < 0
          ? "Price is negative"
          : null,
    },
  });

  const onSubmit = form.onSubmit((values) => {
    onSave({ ...values, id: initialPrize.id });
  });

  return (
    <>
      <Container size="xs">
        <form onSubmit={onSubmit}>
          <TextInput label="Name" {...form.getInputProps("name")} />
          <NumberInput
            label="Stock"
            min={0}
            precision={0}
            {...form.getInputProps("stock")}
          />
          <NumberInput label="Price" min={0} {...form.getInputProps("price")} />
          <TextInput
            label="Description"
            {...form.getInputProps("description")}
          />
          <FileInput
            clearable
            label="Image"
            placeholder="Click to upload image"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(file) => {
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  if (reader.result && typeof reader.result === "string") {
                    form.setFieldValue("image", reader.result);
                  }
                };
                reader.readAsDataURL(file);
              } else {
                form.setFieldValue("image", initialPrize.image);
              }
            }}
          />

          <Text fz="sm">Image Preview</Text>
          <Center>
            <Image
              withPlaceholder
              width={340}
              height={200}
              src={form.values.image}
            />
          </Center>

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

export default MgmtEditPrize;
