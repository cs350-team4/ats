import type React from "react";
import { TextInput, PasswordInput, Button, Box } from "@mantine/core";
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
      <Box maw={300} mx="auto">
        <form
          onSubmit={form.onSubmit(({ username, password }) =>
            onSubmit(username, password)
          )}
        >
          <TextInput
            withAsterisk
            label="Username"
            {...form.getInputProps("username")}
          />

          <PasswordInput
            withAsterisk
            label="Password"
            {...form.getInputProps("password")}
          />

          <Button type="submit" mt="md" fullWidth>
            Submit
          </Button>
        </form>
      </Box>
    </>
  );
};

export default AuthPassword;
