import type React from "react";
import { Button, Center, Text } from "@mantine/core";
import { useAuth, useAuthManagement, UseAuthResult } from "../data/auth";
import { useCurrentTicketCount } from "../data/prize";

/**
 * This ensures that auth is defined (i.e., user is logged in) without breaking type system or react hook rules
 */
const KioskSidePanelBody: React.FC<{ auth: UseAuthResult }> = ({ auth }) => {
  const { logout } = useAuthManagement();
  const { data: currentTicket, status: currentTicketStatus } =
    useCurrentTicketCount(auth.jwt);

  return (
    <>
      <Text size="xl" weight={700}>
        {auth.name}
      </Text>
      {currentTicketStatus === "loading" ? (
        <Text>Getting the number of tickets...</Text>
      ) : currentTicketStatus === "error" ? (
        <Text>Cannot get the number of tickets.</Text>
      ) : (
        <Text>You have {currentTicket} tickets.</Text>
      )}

      <Button color="red" mt="md" onClick={logout}>
        Logout
      </Button>
    </>
  );
};

/**
 * Kiosk UI side panel. It shows the name, remaining tickets, and logout button.
 * In the future, this can be expanded to show other information (e.g., recently played games, statistics, etc.)
 */
const KioskSidePanel: React.FunctionComponent = () => {
  const auth = useAuth();

  if (!auth) {
    // Display when logged out
    return (
      <Center>
        <Text>Not logged in</Text>
      </Center>
    );
  }

  return <KioskSidePanelBody auth={auth} />;
};

export default KioskSidePanel;
