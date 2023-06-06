import type React from "react";
import { Alert, Button, Container, Group, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useAuthSetJWT, useAuth } from "../data/auth";

/**
 * This component is for testing PC app components where login is managed on the electron side.
 * It sets the JWT without verification.
 */
const TestInjectJWT: React.FunctionComponent = () => {
  const authSetJWT = useAuthSetJWT();
  const auth = useAuth();
  const form = useForm({
    initialValues: {
      jwt: "",
    },
  });

  return (
    <>
      <Container size="xs">
        {/* Shows current JWT in read-only box */}
        <Textarea label="Current JWT" value={auth ? auth.jwt : "Unset"} />

        {/* Form for setting JWT */}
        <form
          onSubmit={form.onSubmit(({ jwt }) => authSetJWT.loginWithJWT(jwt))}
        >
          <Textarea label="JWT" {...form.getInputProps("jwt")} />

          <Group grow mt="md">
            <Button type="submit">Set</Button>
            <Button onClick={authSetJWT.logout}>Logout</Button>
          </Group>
        </form>

        {/* Display error */}
        {authSetJWT.error && (
          <Alert
            title="Set JWT Error"
            color="red"
            mt="md"
            withCloseButton
            onClose={authSetJWT.clearError}
          >
            {authSetJWT.error.name}: {authSetJWT.error.message}
          </Alert>
        )}
      </Container>
    </>
  );
};

export default TestInjectJWT;
