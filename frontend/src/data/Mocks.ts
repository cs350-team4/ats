// For mocking HTTP API

import { API_ROOT } from "../global.config";
import { rest } from "msw";
import * as jose from "jose";
import type { Prize } from "./prize";

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

// Prize list
export const PRIZE_LIST: Prize[] = [
  {
    prizeId: "1",
    name: "Item 1",
    stock: 1000,
    cost: 100,
    description: "Item Description. ",
    image: "https://placehold.jp/3d4070/ffffff/512x357.jpg",
  },
  {
    prizeId: "2",
    name: "Item 2",
    stock: 1000,
    cost: 200,
    description: "Item Description. ",
    image: "https://placehold.jp/3d4070/ffffff/512x357.jpg",
  },
  {
    prizeId: "3",
    name: "Item 3",
    stock: 1000,
    cost: 300,
    description: "Item Description. ",
    image: "https://placehold.jp/3d4070/ffffff/512x357.jpg",
  },
  {
    prizeId: "4",
    name: "Item 4",
    stock: 1000,
    cost: 400,
    description: "Item Description. ",
    image: "https://placehold.jp/3d4070/ffffff/512x357.jpg",
  },
  {
    prizeId: "5",
    name: "Vuxxi™ Exquisite Umbrella - Summer 2023 Limited Collection Edition by Alessandro Michele",
    stock: 1000,
    cost: 100,
    description: `The Vuxxi branded umbrella is a stunning accessory that effortlessly combines functionality with luxury. Crafted with the utmost attention to detail, it exemplifies Vuxxi's timeless elegance and iconic design aesthetic. 
The umbrella features a sturdy and lightweight construction, ensuring durability and ease of use. Its large canopy provides ample coverage, shielding you from rain or harsh sunlight, while exuding a sense of sophistication. The fabric used is of the highest quality, offering excellent water resistance and UV protection.
What sets the Vuxxi branded umbrella apart is its exquisite design. The canopy showcases Vuxxi's signature VX logo, intricately woven or printed onto the fabric, instantly recognizable to fashion enthusiasts. The brand's iconic motifs, such as the interlocking G pattern or the vibrant floral prints from the Vuxxi Garden collection, adorn the umbrella, making it a true statement piece.
The handle of the umbrella is meticulously crafted, featuring luxurious materials like fine leather, polished metal, or even bamboo, depending on the specific design. The attention to detail extends to every aspect, including the smooth opening and closing mechanism, ensuring effortless operation.
Whether shielding you from the elements or simply adding a touch of opulence to your outfit, the Vuxxi branded umbrella is the epitome of refined style. It is a must-have accessory for those who appreciate the fusion of functionality and high fashion.`,
    image: "https://placehold.jp/3d4070/ffffff/512x357.jpg",
  },
  {
    prizeId: "6",
    name: "Item 6",
    stock: 0,
    cost: 100,
    description: "Item Description. ",
    image: "https://placehold.jp/3d4070/ffffff/512x357.jpg",
  },
  {
    prizeId: "7",
    name: "Item 7",
    stock: 0,
    cost: 400,
    description: "Item Description. ",
    image: "https://placehold.jp/3d4070/ffffff/512x357.jpg",
  },
];

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
