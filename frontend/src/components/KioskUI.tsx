import type React from "react";
import { AppShell, Navbar } from "@mantine/core";
import AuthLogin from "./AuthLogin";
import { useAuth } from "../data/auth";
import KioskIssueCoupon from "./KioskIssueCoupon";
import KioskSidePanel from "./KioskSidePanel";
import GlobalWrapper from "./GlobalWrapper";

/**
 * Full Kiosk UI. This is what should be displayed on the kiosk.
 */
const KioskUI: React.FunctionComponent = () => {
  const auth = useAuth();

  if (!auth) {
    // Display login page when logged out
    return (
      <GlobalWrapper>
        <AuthLogin />
      </GlobalWrapper>
    );
  }

  return (
    <GlobalWrapper>
      <AppShell
        padding="md"
        navbar={
          <Navbar width={{ base: 300 }} height="100%" p="md">
            <KioskSidePanel />
          </Navbar>
        }
      >
        <KioskIssueCoupon />
      </AppShell>
    </GlobalWrapper>
  );
};

export default KioskUI;
