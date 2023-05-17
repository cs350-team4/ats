import type React from "react";
import { TextInput, PasswordInput, Button, Container } from "@mantine/core";
import { useForm } from "@mantine/form";

export interface AuthPasswordProps {
  /** This component will submit username and password this way.
   * The parent component should control operations (e.g., prevent input while async is in progress)
   */
  onSubmit: (username: string, password: string) => void;
}

const AuthPassword: React.FC<AuthPasswordProps> = ({ onSubmit }) => {
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },
  });

  return (
    <>
      <Container size="xs">
        <form
          onSubmit={form.onSubmit(({ username, password }) =>
            onSubmit(username, password)
          )}
        >
          <TextInput
            withAsterisk
            label="Username"
            required
            {...form.getInputProps("username")}
          />

          <PasswordInput
            withAsterisk
            label="Password"
            required
            {...form.getInputProps("password")}
          />

          <Button type="submit" mt="md" fullWidth>
            Submit
          </Button>
        </form>
      </Container>
    </>
  );
};

export default AuthPassword;
