import type React from "react";
import {
  Center,
  Flex,
  Loader,
  Text,
  Modal,
  Container,
  Button,
} from "@mantine/core";
import { useAuth, UseAuthResult } from "../data/auth";
import KioskPrizeList from "./KioskPrizeList";
import {
  useCouponIssue,
  useCurrentTicketCount,
  usePrizeList,
} from "../data/prize";

/**
 * This ensures that auth is defined (i.e., user is logged in) without breaking type system or react hook rules
 */
const KioskIssueCouponBody: React.FC<{ auth: UseAuthResult }> = ({ auth }) => {
  // setup react hooks
  const {
    data: currentTicket,
    error: currentTicketError,
    status: currentTicketStatus,
  } = useCurrentTicketCount(auth.jwt);
  const {
    data: prizeList,
    error: prizeListError,
    status: prizeListStatus,
  } = usePrizeList();
  const {
    mutate: couponIssue,
    data: couponSerialNumber,
    status: couponIssueStatus,
    error: couponIssueError,
    reset: couponIssueReset,
  } = useCouponIssue();

  // Various loading/error overlays
  if (currentTicketStatus === "loading" || prizeListStatus === "loading") {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (currentTicketStatus === "error") {
    return (
      <Center>
        <Flex mt="md" gap="md" direction="column">
          <Text weight={700}>Error getting the number of tickets.</Text>
          <Text>
            {currentTicketError instanceof Error
              ? `${currentTicketError.name}: ${currentTicketError.message}`
              : "Unknown error"}
          </Text>
        </Flex>
      </Center>
    );
  }

  if (prizeListStatus === "error") {
    return (
      <Center>
        <Flex mt="md" gap="md" direction="column">
          <Text weight={700}>Error getting the list of tickets.</Text>
          <Text>
            {prizeListError instanceof Error
              ? `${prizeListError.name}: ${prizeListError.message}`
              : "Unknown error"}
          </Text>
        </Flex>
      </Center>
    );
  }

  // Actual component
  return (
    <>
      <Modal
        opened={couponIssueStatus !== "idle"}
        onClose={couponIssueReset}
        closeOnEscape={false}
        closeOnClickOutside={false}
        title="Coupon Issue"
        centered
      >
        <Container size="xs">
          <Flex
            m="md"
            gap="md"
            direction="column"
            align="center"
            justify="center"
          >
            {couponIssueStatus === "loading" && (
              <>
                <Text size="lg" weight={700}>
                  Please wait while coupon is being issued
                </Text>
                <Loader />
              </>
            )}

            {couponIssueStatus === "success" && (
              <>
                <Text size="lg" weight={700}>
                  Coupon issued
                </Text>
                <Text>{couponSerialNumber}</Text>
                <Text>
                  ※ Please keep note of this serial number to redeem prizes.
                </Text>
              </>
            )}

            {couponIssueStatus === "error" && (
              <>
                <Text size="lg" weight={700}>
                  Error while issuing coupon
                </Text>
                <Text>
                  {couponIssueError instanceof Error
                    ? `${couponIssueError.name}: ${couponIssueError.message}`
                    : "Unknown error"}
                </Text>
                <Text>※ Please contact staff for further assistance.</Text>
              </>
            )}

            {(couponIssueStatus === "error" ||
              couponIssueStatus === "success") && (
              <Button fullWidth radius="xl" onClick={couponIssueReset}>
                OK
              </Button>
            )}
          </Flex>
        </Container>
      </Modal>

      <KioskPrizeList
        currentTickets={currentTicket}
        onPick={(prizeId) => {
          couponIssue({ jwt: auth.jwt, prizeId });
        }}
        prizes={prizeList}
      />
    </>
  );
};

/**
 * Kiosk page for issuing coupons
 */
const KioskIssueCoupon: React.FunctionComponent = () => {
  const auth = useAuth();

  if (!auth) {
    return (
      <Center>
        <Text>Not logged in</Text>
      </Center>
    );
  }

  return <KioskIssueCouponBody auth={auth} />;
};

export default KioskIssueCoupon;
