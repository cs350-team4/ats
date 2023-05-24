import { API_ROOT, PUBLIC_KEY_CACHE_TIME } from "../global.config";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import * as jose from "jose";
import * as t from "io-ts";
import { parseJsonResponse } from "./utils";

export enum UserClass {
  client = "client",
  staff = "staff",
  manager = "manager",
}

// Parsed token payload
export interface Token {
  name: string;
  iat?: Date;
  sub: UserClass;
  exp?: Date;
}

// Store state
interface State {
  // raw jwt
  jwt: string;
  // parsed jwt
  token?: Token;
}

// Store actions
interface Actions {
  // set token on successful login
  setToken: (jwt: string, token: Token) => void;
  // clear, effectively logout
  clear: () => void;
}

// Main store. For use within this file only. State in this store is shared across all components.
const useAuthStore = create(
  immer<State & Actions>((set) => ({
    jwt: "",

    setToken: (jwt, token) => {
      set((state) => {
        state.jwt = jwt;
        state.token = token;
      });
    },

    clear: () => {
      set((state) => {
        state.jwt = "";
        state.token = undefined;
      });
    },
  }))
);

/**
 * Public API for useAuth
 */
export interface UseAuthResult {
  name: string;
  userClass: UserClass;
  jwt: string;
}

/**
 * React hook for consumer of auth states
 * This one is intended for components that only read these information
 * Returns undefined if not logged in
 */
export const useAuth = (): UseAuthResult | undefined => {
  const [jwt, token] = useAuthStore((state) => [state.jwt, state.token]);

  if (token) {
    return {
      name: token.name,
      userClass: token.sub,
      jwt,
    };
  }
};

// Custom error for public key query
export class PublicKeyQueryError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "Public key query error";
  }
}

const queryPublicKey = async () => {
  // get request public key from server
  const res = await fetch(API_ROOT + "/auth/publicKey");

  const data = await parseJsonResponse(
    res,
    t.type({
      publicKey: t.string,
    }),
    PublicKeyQueryError
  );

  return jose.importSPKI(data.publicKey, "ES256");
};

// Custom error for public key query
export class AuthenticationError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "Authentication error";
  }
}

/**
 * Public API for useAuthManagement
 */
export interface UseAuthManangementResult {
  // when true, show a loading indicator and block user from clicking login button
  logginIn: boolean;
  loginWithPassword: (username: string, password: string) => Promise<void>;
  loginWithQR: (data: string) => Promise<void>;
  logout: () => void;
  // show error if set. no error if undefined
  error?: Error;
  clearError: () => void;
}

/**
 * React hook for consumer of auth states
 * This one is intended for components that manages logging in/out
 */
export const useAuthManagement = (): UseAuthManangementResult => {
  // lock the UI
  const [loggingIn, setLoggingIn] = useState(false);
  // error to be displayed on the UI
  const [error, setError] = useState<Error>();
  // access authstore
  const authStore = useAuthStore((state) => state);
  // query public key from server
  const {
    error: pkQueryError,
    data: pkQueryData,
    isLoading: pkQueryLoading,
  } = useQuery({
    refetchOnWindowFocus: false,
    cacheTime: PUBLIC_KEY_CACHE_TIME,
    queryKey: ["publicKey"],
    queryFn: queryPublicKey,
  });

  // helper function used by the actual login function
  const verifyAndSetToken = async (jwt: string) => {
    if (!pkQueryData) {
      // This should not happen as the UI should block (if pkQuery is loading) or error is displayed already
      return;
    }

    const { payload } = await jose.jwtVerify(jwt, pkQueryData, {
      algorithms: ["ES256"],
    });

    authStore.setToken(jwt, {
      name: (payload.name as string) ?? "",
      sub: (payload.sub as UserClass) ?? UserClass.client,
      iat: payload.iat ? new Date(payload.iat) : undefined,
      exp: payload.exp ? new Date(payload.exp) : undefined,
    });
  };

  // this is the api exposed to the consumer
  const loginWithPassword = async (username: string, password: string) => {
    // check for existing loggingIn and ignore if already trying
    // there's no race condition as this code is sequential
    if (loggingIn) {
      return;
    }
    setLoggingIn(true);

    try {
      // login with the backend
      const res = await fetch(API_ROOT + "/auth/generateToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await parseJsonResponse(
        res,
        t.type({
          auth_token: t.string,
        }),
        AuthenticationError
      );

      await verifyAndSetToken(data.auth_token);

      // parse response
      const body: unknown = await res.json();
      if (typeof body !== "object" || body === null) {
        throw new Error("Server responded with invalid JSON");
      }
    } catch (err: unknown) {
      // set error for ui to display
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new AuthenticationError("Unknown error"));
      }
    } finally {
      // restore to ability to log in
      setLoggingIn(false);
    }
  };

  // this is the api exposed to the consumer
  const loginWithQR = async (data: string) => {
    // check for existing loggingIn and ignore if already trying
    // there's no race condition as this code is sequential
    if (loggingIn) {
      return;
    }
    setLoggingIn(true);

    try {
      // re-add the jwt header
      const jwt = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9." + data;
      console.log(jwt);
      await verifyAndSetToken(jwt);
    } catch (err: unknown) {
      // set error for ui to display
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new AuthenticationError("Unknown Error"));
      }
    } finally {
      // restore to ability to log in
      setLoggingIn(false);
    }
  };

  // pack everything and send to consumer
  return {
    loginWithPassword,
    loginWithQR,
    logginIn: loggingIn || pkQueryLoading,
    logout: () => {
      authStore.clear();
    },
    error: error || (pkQueryError as Error),
    clearError: () => {
      setError(undefined);
    },
  };
};
