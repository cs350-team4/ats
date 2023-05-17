import type React from "react";
import { useAuth, useAuthManagement } from "../data/auth";
import { Container, Button } from "@mantine/core";
import AuthLogin from "./AuthLogin";

/**
 * A demo component for the consumption of auth api.
 * Don't use this component directly in the app.
 * This one just shows what the eventual auth api (on the frontend side) should look like.
 */
const AuthUsageDemo: React.FunctionComponent = () => {
  const auth = useAuth();
  const { logout } = useAuthManagement();

  if (!auth) {
    // Display this when logged out
    return (
      <>
        <Container size="xs">
          <p>Not logged in</p>
          {/* The AuthLogin is for demo */}
          {/* AuthLogin isn't needed here for most components as that will be handled by the parents */}
          <AuthLogin />
        </Container>
      </>
    );
  }

  // Display this when logged in
  return (
    <>
      <Container size="xs">
        <p>Name: {auth.name}</p>
        <p>userClass: {auth.userClass}</p>
        <p>jwt: {auth.jwt}</p>
        <Button color="red" onClick={logout}>
          Logout
        </Button>
      </Container>
    </>
  );
};

export default AuthUsageDemo;
