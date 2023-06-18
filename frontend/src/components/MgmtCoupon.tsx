import type React from "react";
import {
  Button,
  Center,
  Container,
  Group,
  Loader,
  Text,
  TextInput,
} from "@mantine/core";
import { useAuth } from "../data/auth";
import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import { API_ROOT } from "../global.config";
import { useState } from "react";

interface CouponUseVariables {
  jwt: string;
  serialNum: string;
}

/**
 * Coupon validation page
 */
const MgmtCoupon: React.FunctionComponent = () => {
  const auth = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      serialNum: "",
    },
  });
  const { mutate: checkCoupon, status: couponStatus } = useMutation({
    mutationFn: async ({ jwt, serialNum }: CouponUseVariables) => {
      setSuccessMessage(null);
      const res = await fetch(API_ROOT + "/coupon/" + serialNum, {
        method: "PATCH",
        headers: {
          Authorization: "Bearer " + jwt,
        },
      });
      if (res.status === 404) {
        throw new Error("No such coupon");
      } else if (res.status === 409) {
        throw new Error("Coupon already used");
      }

      return res.status;
    },
    onSuccess: () => {
      setSuccessMessage("Successfully used coupon");
    },
    onError: (err) => {
      if (err instanceof Error) {
        form.setFieldError("serialNum", err.message);
      }
    },
  });

  if (!auth) {
    return (
      <Center>
        <Text>Not logged in</Text>
      </Center>
    );
  }

  const onSubmit = form.onSubmit((values) => {
    checkCoupon({ jwt: auth.jwt, serialNum: values.serialNum });
  });

  return (
    <Container size="xs">
      <form onSubmit={onSubmit}>
        <TextInput label="Serial number" {...form.getInputProps("serialNum")} />
        {!!successMessage && (
          <Text color="green" size="xs" weight="bold">
            {successMessage}
          </Text>
        )}

        <Group grow mt="md">
          {couponStatus === "loading" ? (
            <Loader />
          ) : (
            <Button color="blue" radius="xl" type="submit">
              Check
            </Button>
          )}
        </Group>
      </form>
    </Container>
  );
};

export default MgmtCoupon;
