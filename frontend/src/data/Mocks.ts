// For mocking HTTP API

import { API_ROOT } from "../global.config";
import { rest } from "msw";
import * as jose from "jose";

// Public secp256r1 key. For testing purposes only.
export const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE1baLq9Kv9jRQLqGOL8M9oFibDSMK
kizV127PGj4sSiGlQwoU+ZqNAvGgYh//EcHrmrOHfUyiyt2ZAHi12Rlf8A==
-----END PUBLIC KEY-----`;

// Private secp256r1 key. For testing purposes only.
export const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg1uO2fVUNyfAgJ9Y4
m2oFJwlPipVTXMDk0mHeXAy4a4ShRANCAATVtour0q/2NFAuoY4vwz2gWJsNIwqS
LNXXbs8aPixKIaVDChT5mo0C8aBiH/8Rweuas4d9TKLK3ZkAeLXZGV/w
-----END PRIVATE KEY-----`;

// For testing AuthPassword. Format is name: password
export const USER_PASSWORDS: Record<string, string> = {
  mock1: "hunter2",
  mock2: "solarwinds123",
};

export default [
  rest.get(API_ROOT + "/auth/publicKey", (req, res, ctx) => {
    return res(ctx.json({ publicKey: PUBLIC_KEY }));
  }),
  rest.post(API_ROOT + "/auth/generateToken", async (req, res, ctx) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const body: object = await req.json();

    if (
      "username" in body &&
      typeof body.username === "string" &&
      "password" in body
    ) {
      if (
        body.username in USER_PASSWORDS &&
        USER_PASSWORDS[body.username] === body.password
      ) {
        let jwt;
        try {
          jwt = await new jose.SignJWT({ name: body.username })
            .setProtectedHeader({ alg: "ES256" })
            .sign(await jose.importPKCS8(PRIVATE_KEY, "ES256"));
        } catch (err) {
          console.log(err);
        }

        console.log(jwt);

        return res(
          ctx.json({
            auth_token: jwt,
          })
        );
      } else {
        return res(
          ctx.status(403),
          ctx.json({ message: "Invalid authentication" })
        );
      }
    } else {
      return res(ctx.status(400), ctx.json({ message: "Malformed request" }));
    }
  }),
];
