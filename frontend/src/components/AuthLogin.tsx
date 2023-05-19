import type React from "react";
import { Container, Box, Alert, Tabs, LoadingOverlay } from "@mantine/core";
import AuthPassword from "./AuthPassword";
import AuthQR from "./AuthQR";
import { useAuthManagement } from "../data/auth";

/**
 * The main component for loggin in. Combines both password and QR into one.
 */
const AuthLogin: React.FunctionComponent = () => {
  const authManagement = useAuthManagement();

  return (
    <>
      <Container size="xs">
        <Box>
          {/* Block user interaction while logging in */}
          <LoadingOverlay
            visible={authManagement.logginIn ?? true}
            overlayBlur={2}
          />

          <Tabs variant="outline" defaultValue="QR">
            <Tabs.List>
              <Tabs.Tab value="password">Password</Tabs.Tab>
              <Tabs.Tab value="QR">QR Code</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="password" pt="xs">
              <AuthPassword
                onSubmit={(username, password) => {
                  authManagement.clearError();
                  // Note: we're ignoring the promise here as the waiting mechanism is done via other means
                  // eslint-disable-next-line no-void
                  void authManagement.loginWithPassword(username, password);
                }}
              />
            </Tabs.Panel>

            <Tabs.Panel value="QR" pt="xs">
              <AuthQR
                onScan={(data) => {
                  authManagement.clearError();
                  // Note: we're ignoring the promise here as the waiting mechanism is done via other means
                  // eslint-disable-next-line no-void
                  void authManagement.loginWithQR(data);
                }}
              />
            </Tabs.Panel>
          </Tabs>
        </Box>

        {authManagement.error && (
          <Alert
            title="Authentication"
            color="red"
            mt="md"
            withCloseButton
            onClose={authManagement.clearError}
          >
            {authManagement.error.name}: {authManagement.error.message}
          </Alert>
        )}
      </Container>
    </>
  );
};

export default AuthLogin;
