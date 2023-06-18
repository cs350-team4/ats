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

interface Coupon {
  time_used: null | string;
}
/**
 * Coupon validation page
 */
const MgmtCoupon: React.FunctionComponent = () => {
  const auth = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm({
    initialValues: {
      serialNum: "",
    },
  });
  const { mutate: useCoupon, status: useCouponStatus } = useMutation({
    mutationFn: async ({ jwt, serialNum }: CouponUseVariables) => {
      setSuccessMessage(null);
      setInfoMessage(null);
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

  const handleCheck = async () => {
    setSuccessMessage(null);
    form.setErrors({});
    setIsLoading(true);
    try {
      if (!auth) throw Error("Must be authenticated");
      const res = await fetch(API_ROOT + "/coupon/" + form.values.serialNum, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth?.jwt}`,
        },
      });
      console.log(res);
      if (res.status === 404) {
        setInfoMessage("No such coupon");
        setIsLoading(false);
        return;
      }
      const data = (await res.json()) as Coupon;
      if (data.time_used === null) {
        setInfoMessage("Coupon not used");
      } else {
        setInfoMessage(`Coupon already used: ${data.time_used}`);
      }
    } catch (error) {
      console.error("Error fetching coupon", error);
    }
    setIsLoading(false);
  };

  if (!auth) {
    return (
      <Center>
        <Text>Not logged in</Text>
      </Center>
    );
  }

  const onSubmit = form.onSubmit((values) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useCoupon({ jwt: auth.jwt, serialNum: values.serialNum });
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
        {!!infoMessage && (
          <Text color="blue" size="xs" weight="bold">
            {infoMessage}
          </Text>
        )}

        <Group grow mt="md">
          {isLoading ? (
            <Loader />
          ) : (
            <>
              {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
              <Button color="blue" radius="xl" onClick={handleCheck}>
                check
              </Button>
            </>
          )}
          {useCouponStatus === "loading" ? (
            <Loader />
          ) : (
            <Button color="blue" radius="xl" type="submit">
              Use
            </Button>
          )}
        </Group>
      </form>
    </Container>
  );
};

export default MgmtCoupon;
