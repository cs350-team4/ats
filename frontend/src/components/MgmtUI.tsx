import type React from "react";
import { useState } from "react";
import { AppShell, Navbar, Text, Button } from "@mantine/core";
import { UserClass, useAuth, useAuthSetJWT, UseAuthResult } from "../data/auth";
import GlobalWrapper from "./GlobalWrapper";
import TestInjectJWT from "./TestInjectJWT";
import MgmtPrize from "./MgmtPrize";
import MgmtGame from "./MgmtGame";
import MgmtCoupon from "./MgmtCoupon";
import Logs from "./Logs";

enum Pages {
  MgmtPrize,
  MgmtGame,
  MgmtCoupon,
  Logs,
}

const MgmtSidePanel: React.FC<{
  auth: UseAuthResult;
  page: Pages;
  setPage: (newPage: Pages) => void;
}> = ({ auth, page, setPage }) => {
  const { logout } = useAuthSetJWT();

  return (
    <>
      <Text size="xl" weight={700}>
        {auth.name}
      </Text>
      <Text>{auth.userClass}</Text>

      <Button
        mt="md"
        disabled={page === Pages.MgmtCoupon}
        onClick={() => setPage(Pages.MgmtCoupon)}
      >
        Validate Coupons
      </Button>

      {auth.userClass === UserClass.manager && (
        <>
          <Button
            mt="md"
            disabled={page === Pages.MgmtPrize}
            onClick={() => setPage(Pages.MgmtPrize)}
          >
            Manage Prizes
          </Button>

          <Button
            mt="md"
            disabled={page === Pages.MgmtGame}
            onClick={() => setPage(Pages.MgmtGame)}
          >
            Manage Games
          </Button>

          <Button
            mt="md"
            disabled={page === Pages.Logs}
            onClick={() => setPage(Pages.Logs)}
          >
            Logs
          </Button>
        </>
      )}

      <Button color="red" mt="md" onClick={logout}>
        Logout
      </Button>
    </>
  );
};

/**
 * Full Management UI.
 */
const MgmtUI: React.FunctionComponent = () => {
  const auth = useAuth();
  const [page, setPage] = useState(Pages.MgmtCoupon);

  if (!auth) {
    return (
      <GlobalWrapper>
        <TestInjectJWT />
      </GlobalWrapper>
    );
  }

  let pageComponent;
  if (page === Pages.MgmtGame) {
    pageComponent = <MgmtGame />;
  } else if (page === Pages.MgmtPrize) {
    pageComponent = <MgmtPrize />;
  } else if (page === Pages.Logs) {
    pageComponent = <Logs />;
  } else {
    pageComponent = <MgmtCoupon />;
  }

  return (
    <GlobalWrapper>
      <AppShell
        padding="md"
        navbar={
          <Navbar width={{ base: 300 }} height="100%" p="md">
            <MgmtSidePanel auth={auth} page={page} setPage={setPage} />
          </Navbar>
        }
      >
        {pageComponent}
      </AppShell>
    </GlobalWrapper>
  );
};

export default MgmtUI;
