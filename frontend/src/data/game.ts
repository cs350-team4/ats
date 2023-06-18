import * as t from "io-ts";
import {
  API_ROOT,
  GAME_LIST_CACHE_TIME,
  GAME_LIST_STALE_TIME,
} from "../global.config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ParseJsonErrOptions, parseJsonResponse } from "./utils";

export interface Game {
  id: string;
  name: string;
  exchangeRate: number;
  password: string;
}

// Custom error for public key query
export class GameListQueryError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "Game list query error";
  }
}

export interface GameListVariables {
  meta: {
    jwt: string;
  };
}

/**
 * React hook for game list
 */
export const useGameList = (jwt: string) => {
  return useQuery({
    queryKey: ["gameList"],
    cacheTime: GAME_LIST_CACHE_TIME,
    staleTime: GAME_LIST_STALE_TIME,
    queryFn: async (): Promise<Game[]> => {
      // get current ticket from server
      const res = await fetch(API_ROOT + "/games/", {
        headers: {
          Authorization: "Bearer " + jwt,
        },
      });

      const data = await parseJsonResponse(
        res,
        t.array(
          t.type({
            id: t.union([t.number, t.string]),
            name: t.string,
            exchange_rate: t.number,
            password: t.string,
          })
        ),
        GameListQueryError
      );

      return data.map((item) => {
        return {
          id: typeof item.id === "number" ? item.id.toFixed() : item.id,
          name: item.name,
          exchangeRate: item.exchange_rate,
          password: item.password,
        };
      });
    },
  });
};


// Custom error for game update mutations
export class GameUpdateError extends Error {
  httpCode?: number;

  constructor(message?: string, options?: ParseJsonErrOptions) {
    super(message, options);
    this.name = "Game update error";
    this.httpCode = options?.httpCode;
  }
}

// Parameters for calling create game mutation
export interface CreateGameVariables {
  jwt: string;
  game: Game;
}

/**
 * React hook for creating game
 */
export const useCreateGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jwt, game }: CreateGameVariables) => {
      const res = await fetch(API_ROOT + "/games/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + jwt,
        },
        body: JSON.stringify({
          name: game.name,
          password: game.password,
          exchange_rate: game.exchangeRate,
        }),
      });

      // ignore the return result as the entire gameList will be refresh anyway
      await parseJsonResponse(res, t.any, GameUpdateError);
    },
    onSettled: () => {
      // refresh game list
      return queryClient.invalidateQueries({
        queryKey: ["gameList"],
      });
    },
  });
};

// Parameters for calling patch game mutation
export interface PatchGameVariables {
  jwt: string;
  game: Game;
}

/**
 * React hook for patching (update existing) game
 */
export const usePatchGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jwt, game }: PatchGameVariables) => {
      const res = await fetch(API_ROOT + "/games/" + game.id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + jwt,
        },
        body: JSON.stringify({
          name: game.name,
          password: game.password,
          exchange_rate: game.exchangeRate,
        }),
      });

      // ignore the return result as the entire gameList will be refresh anyway
      await parseJsonResponse(res, t.any, GameUpdateError);
    },
    onSettled: () => {
      // refresh game list
      return queryClient.invalidateQueries({
        queryKey: ["gameList"],
      });
    },
  });
};

// Parameters for calling delete game mutation
export interface DeleteGameVariables {
  jwt: string;
  gameId: string;
}

/**
 * React hook for deleting game
 */
export const useDeleteGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jwt, gameId }: DeleteGameVariables) => {
      const res = await fetch(API_ROOT + "/games/" + gameId, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + jwt,
        },
      });

      // ignore the return result as the entire gameList will be refresh anyway
      await parseJsonResponse(res, t.any, GameUpdateError);
    },
    onSettled: () => {
      // refresh game list
      return queryClient.invalidateQueries({
        queryKey: ["gameList"],
      });
    },
  });
};
