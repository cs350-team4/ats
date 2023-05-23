import { isLeft } from "fp-ts/lib/Either";
import type * as t from "io-ts";

/**
 * Safely parse HTTP fetch response
 * @param res HTTP fetch response
 * @param typ Expected JSON response type
 * @param ErrTyp Custom error type
 * @returns Parsed JSON if successful
 * @throws Constructed error if not successful
 */
export const parseJsonResponse = async <T>(
  res: Response,
  typ: t.Type<T>,
  ErrTyp: { new (message: string, options?: ErrorOptions): Error } = Error
): Promise<T> => {
  const body: unknown = await res.json();

  if (res.ok) {
    // extract body
    const data = typ.decode(body);
    if (isLeft(data)) {
      throw new ErrTyp("Server responded with invalid format");
    }

    return data.right;
  } else {
    if (
      body &&
      typeof body === "object" &&
      "message" in body &&
      typeof body.message === "string"
    ) {
      throw new ErrTyp(body.message);
    } else {
      throw new ErrTyp("Unknown server error");
    }
  }
};
