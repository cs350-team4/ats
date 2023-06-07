import * as t from "io-ts";
import {
  API_ROOT,
  PRIZE_LIST_CACHE_TIME,
  PRIZE_LIST_LIMIT,
  PRIZE_LIST_STALE_TIME,
} from "../global.config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ParseJsonErrOptions, parseJsonResponse } from "./utils";

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
          Authorization: "Bearer " + queryKey[1],
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
    cacheTime: PRIZE_LIST_CACHE_TIME,
    staleTime: PRIZE_LIST_STALE_TIME,
    queryFn: async (): Promise<Prize[]> => {
      // get current ticket from server
      const res = await fetch(
        API_ROOT +
          "/prizes/?" +
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

      return data.map((item) => {
        let dataUrl = "";
        // detect image type and transforms them into data url
        switch (item.image.charAt(0)) {
          case "/":
            // jpg
            dataUrl = "data:image/jpeg;base64," + item.image;
            break;
          case "i":
            // png
            dataUrl = "data:image/png;base64," + item.image;
            break;
          case "R":
            // gif
            dataUrl = "data:image/gif;base64," + item.image;
            break;
          case "U":
            // webp
            dataUrl = "data:image/webp;base64," + item.image;
            break;
          case "P":
            // svg
            dataUrl = "data:image/svg+xml;base64," + item.image;
            break;
          default:
            // Unknown
            dataUrl = item.image;
            break;
        }

        return {
          id: typeof item.id === "number" ? item.id.toFixed() : item.id,
          name: item.name,
          stock: item.stock,
          price: item.price,
          description: item.description,
          image: dataUrl,
        };
      });
    },
  });
};

// Custom error for coupon issue mutation
export class CouponIssueError extends Error {
  httpCode?: number;

  constructor(message?: string, options?: ParseJsonErrOptions) {
    super(message, options);
    this.name = "Coupon issue error";
    this.httpCode = options?.httpCode;
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
          Authorization: "Bearer " + jwt,
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
        CouponIssueError
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
    onError: (error) => {
      if (error instanceof CouponIssueError) {
        if (error.httpCode === 409) {
          // invalidate prize list if out of stock error
          // don't need to wait for prize list refresh as that can take a long time

          // eslint-disable-next-line no-void
          void queryClient.invalidateQueries({
            queryKey: ["prizeList"],
          });
        }
      }
    },
  });
};

/**
 * Strip the data url prefix
 * @param dataUrl base64 encoded data url
 * @returns base64 encoded data
 */
const stripDataUrl = (dataUrl: string): string => {
  return dataUrl.replace(/^data:(?:.*?),/, "");
};

// Custom error for prize update mutations
export class PrizeUpdateError extends Error {
  httpCode?: number;

  constructor(message?: string, options?: ParseJsonErrOptions) {
    super(message, options);
    this.name = "Prize update error";
    this.httpCode = options?.httpCode;
  }
}

// Parameters for calling create prize mutation
export interface CreatePrizeVariables {
  jwt: string;
  prize: Prize;
}

/**
 * React hook for creating prize
 */
export const useCreatePrize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jwt, prize }: CreatePrizeVariables) => {
      const res = await fetch(API_ROOT + "/prizes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + jwt,
        },
        body: JSON.stringify({
          name: prize.name,
          stock: prize.stock,
          price: prize.price,
          description: prize.description,
          image: stripDataUrl(prize.image),
        }),
      });

      // ignore the return result as the entire prizeList will be refresh anyway
      await parseJsonResponse(res, t.any, PrizeUpdateError);
    },
    onSettled: () => {
      // refresh prize list
      return queryClient.invalidateQueries({
        queryKey: ["prizeList"],
      });
    },
  });
};

// Parameters for calling patch prize mutation
export interface PatchPrizeVariables {
  jwt: string;
  prize: Prize;
}

/**
 * React hook for patching (update existing) prize
 */
export const usePatchPrize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jwt, prize }: PatchPrizeVariables) => {
      const res = await fetch(API_ROOT + "/prizes/" + prize.id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + jwt,
        },
        body: JSON.stringify({
          name: prize.name,
          stock: prize.stock,
          price: prize.price,
          description: prize.description,
          image: stripDataUrl(prize.image),
        }),
      });

      // ignore the return result as the entire prizeList will be refresh anyway
      await parseJsonResponse(res, t.any, PrizeUpdateError);
    },
    onSettled: () => {
      // refresh prize list
      return queryClient.invalidateQueries({
        queryKey: ["prizeList"],
      });
    },
  });
};

// Parameters for calling delete prize mutation
export interface DeletePrizeVariables {
  jwt: string;
  prizeId: string;
}

/**
 * React hook for deleting prize
 */
export const useDeletePrize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jwt, prizeId }: DeletePrizeVariables) => {
      const res = await fetch(API_ROOT + "/prizes/" + prizeId, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + jwt,
        },
      });

      // ignore the return result as the entire prizeList will be refresh anyway
      await parseJsonResponse(res, t.any, PrizeUpdateError);
    },
    onSettled: () => {
      // refresh prize list
      return queryClient.invalidateQueries({
        queryKey: ["prizeList"],
      });
    },
  });
};
