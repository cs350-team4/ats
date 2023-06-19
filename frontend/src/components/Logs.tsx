import * as t from "io-ts";
import { Center, Text, Tabs, Button } from "@mantine/core";
import type React from "react";
import { useAuth } from "../data/auth";
import { useInfiniteQuery } from "@tanstack/react-query";
import { parseJsonResponse } from "../data/utils";
import { API_ROOT } from "../global.config";

const Logs: React.FC = () => {
  const auth = useAuth();

  const {
    data: httpData,
    fetchNextPage: fetchNextPageHTTP,
    isFetchingNextPage: isFetchingNextPageHTTP,
  } = useInfiniteQuery({
    queryKey: ["httpLog"],
    queryFn: async ({ pageParam = 1 }) => {
      if (!auth) throw Error("Must be authenticated");
      const res = await fetch(
        API_ROOT +
          "/logs/http?" +
          new URLSearchParams({
            limit: (pageParam * 20).toFixed(),
          }).toLocaleString(),
        {
          headers: {
            Authorization: `Bearer ${auth?.jwt}`,
          },
        }
      );
      const data = await parseJsonResponse(res, t.array(t.string), Error);
      const pageData = data.slice((pageParam - 1) * 20, pageParam * 20);
      return pageData.map((l) => {
        const [timestampNs, log] = l.split("::");
        return (
          new Date(
            Number(timestampNs.slice(0, timestampNs.length - 6))
          ).toLocaleString() +
          "::" +
          log
        );
      });
    },
    getNextPageParam: (_, pages) => pages.length + 1,
  });

  const {
    data: transactionData,
    fetchNextPage: fetchNextPageTransaction,
    isFetchingNextPage: isFetchingNextTransaction,
  } = useInfiniteQuery({
    queryKey: ["transactionLog"],
    queryFn: async ({ pageParam = 1 }) => {
      if (!auth) throw Error("Must be authenticated");
      const res = await fetch(
        API_ROOT +
          "/logs/transaction?" +
          new URLSearchParams({ limit: (pageParam * 10).toFixed() }).toString(),
        {
          headers: {
            Authorization: `Bearer ${auth?.jwt}`,
          },
        }
      );
      const data = await parseJsonResponse(res, t.array(t.string), Error);
      const pageData = data.slice((pageParam - 1) * 10, pageParam * 10);
      return pageData.map((l) => {
        const [timestampNs, log] = l.split("::");
        return (
          new Date(
            Number(timestampNs.slice(0, timestampNs.length - 6))
          ).toLocaleString() +
          "::" +
          log
        );
      });
    },
    getNextPageParam: (_, pages) => pages.length + 1,
  });

  const {
    data: securityData,
    fetchNextPage: fetchNextSecurity,
    isFetchingNextPage: isFetchingNextSecurity,
  } = useInfiniteQuery({
    queryKey: ["securityLog"],
    queryFn: async ({ pageParam = 1 }) => {
      if (!auth) throw Error("Must be authenticated");
      const res = await fetch(
        API_ROOT +
          "/logs/security?" +
          new URLSearchParams({ limit: (pageParam * 10).toFixed() }).toString(),
        {
          headers: {
            Authorization: `Bearer ${auth?.jwt}`,
          },
        }
      );
      const data = await parseJsonResponse(res, t.array(t.string), Error);
      const pageData = data.slice((pageParam - 1) * 10, pageParam * 10);
      return pageData.map((l) => {
        const [timestampNs, log] = l.split("::");
        return (
          new Date(
            Number(timestampNs.slice(0, timestampNs.length - 6))
          ).toLocaleString() +
          "::" +
          log
        );
      });
    },
    getNextPageParam: (_, pages) => pages.length + 1,
    cacheTime: Infinity,
  });

  if (!auth) {
    return (
      <Center>
        <Text>Not logged in</Text>
      </Center>
    );
  }
  return (
    <Tabs defaultValue="http">
      <Tabs.List>
        <Tabs.Tab value="http">HTTP</Tabs.Tab>
        <Tabs.Tab value="transaction">Transaction</Tabs.Tab>
        <Tabs.Tab value="security">Security</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="http">
        {httpData?.pages.map((page, i) => {
          return (
            <div key={i}>
              {page.map((log, k) => {
                return <div key={(i + 1) * 20 + k}>{log}</div>;
              })}
            </div>
          );
        })}

        {/* eslint-disable @typescript-eslint/no-misused-promises */}
        <Button
          mt="sm"
          onClick={() => fetchNextPageHTTP()}
          disabled={isFetchingNextPageHTTP}
        >
          {isFetchingNextPageHTTP ? "Loading more..." : "Load More"}
        </Button>
      </Tabs.Panel>
      <Tabs.Panel value="transaction">
        {transactionData?.pages.map((page, i) => {
          return (
            <div key={i}>
              {page.map((log, k) => {
                return <div key={(i + 1) * 10 + k}>{log}</div>;
              })}
            </div>
          );
        })}
        <Button
          mt="sm"
          onClick={() => fetchNextPageTransaction()}
          disabled={isFetchingNextTransaction}
        >
          {isFetchingNextTransaction ? "Loading more..." : "Load More"}
        </Button>
      </Tabs.Panel>
      <Tabs.Panel value="security">
        {securityData?.pages.map((page, i) => {
          return (
            <div key={i}>
              {page.map((log, k) => {
                return <div key={(i + 1) * 10 + k}>{log}</div>;
              })}
            </div>
          );
        })}
        <Button
          mt="sm"
          onClick={() => fetchNextSecurity()}
          disabled={isFetchingNextSecurity}
        >
          {isFetchingNextSecurity ? "Loading more..." : "Load More"}
        </Button>
        {/* eslint-enable @typescript-eslint/no-misused-promises */}
      </Tabs.Panel>
    </Tabs>
  );
};

export default Logs;
