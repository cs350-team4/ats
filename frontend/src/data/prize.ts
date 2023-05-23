import * as t from "io-ts";
import { API_ROOT, PRIZE_LIST_LIMIT } from "../global.config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseJsonResponse } from "./utils";

export interface Prize {
  id: string;
  name: string;
  stock: number;
  price: number;
  description: string;
  /**
   * Image source is a url (including base64-encoded data url, https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs)
   * Note: image is scaled to cover the space
   */
  image: string;
}

// Custom error for public key query
export class TicketCountQueryError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "Ticket count query error";
  }
}

/**
 * React hook for the current ticket count
 */
export const useCurrentTicketCount = (jwt: string) => {
  return useQuery({
    queryKey: ["currentTicket", jwt],
    queryFn: async ({ queryKey }) => {
      // get current ticket from server
      const res = await fetch(API_ROOT + "/user/tickets", {
        headers: {
          Authentication: "Bearer " + queryKey[1],
        },
      });

      const data = await parseJsonResponse(
        res,
        t.type({
          tickets: t.number,
        }),
        TicketCountQueryError
      );

      return data.tickets;
    },
  });
};

// Custom error for public key query
export class PrizeListQueryError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "Prize list query error";
  }
}

/**
 * React hook for prize list
 */
export const usePrizeList = () => {
  return useQuery({
    queryKey: ["prizeList"],
    queryFn: async (): Promise<Prize[]> => {
      // get current ticket from server
      const res = await fetch(
        API_ROOT +
          "/prizes?" +
          new URLSearchParams({
            limit: PRIZE_LIST_LIMIT.toFixed(),
          }).toString()
      );

      const data = await parseJsonResponse(
        res,
        t.array(
          t.type({
            id: t.union([t.number, t.string]),
            name: t.string,
            description: t.string,
            stock: t.number,
            price: t.number,
            image: t.string,
          })
        ),
        PrizeListQueryError
      );

      return data.map((item) => ({
        id: typeof item.id === "number" ? item.id.toFixed() : item.id,
        name: item.name,
        stock: item.stock,
        price: item.price,
        description: item.description,
        image: item.image,
      }));
    },
  });
};

// Custom error for public key query
export class CouponIssueError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "Coupon issue error";
  }
}

// Parameters for calling coupon issue mutation
export interface CouponIssueVariables {
  jwt: string;
  prizeId: string;
}

/**
 * React hook for issuing coupon for prize
 */
export const useCouponIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jwt, prizeId }: CouponIssueVariables) => {
      const res = await fetch(API_ROOT + "/coupon/issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authentication: "Bearer " + jwt,
        },
        body: JSON.stringify({
          prize_id: Number(prizeId),
        }),
      });

      const data = await parseJsonResponse(
        res,
        t.type({
          serial_number: t.string,
        }),
        PrizeListQueryError
      );

      return data.serial_number;
    },
    onSettled: (_data, _error, variables) => {
      // Note: We should refresh ticket count every time (not just for success) because the error could be client-side
      // in which case, the ticket count will already have been deducted even if we're showing error.

      // update current ticket count
      return queryClient.invalidateQueries({
        queryKey: ["currentTicket", variables.jwt],
      });
    },
  });
};
