import { isLeft } from "fp-ts/lib/Either";
import type * as t from "io-ts";

export interface ParseJsonErrOptions extends ErrorOptions {
  httpCode: number;
  httpMessage: string;
}

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
  ErrTyp: {
    new (message: string, options: ParseJsonErrOptions): Error;
  } = Error
): Promise<T> => {
  if (res.headers.get("content-type") === "application/json") {
    const body: unknown = await res.json();

    if (res.ok) {
      // extract body
      const data = typ.decode(body);
      if (isLeft(data)) {
        throw new ErrTyp("Server responded with invalid format", {
          httpCode: res.status,
          httpMessage: res.statusText,
        });
      }

      return data.right;
    } else {
      if (
        body &&
        typeof body === "object" &&
        "message" in body &&
        typeof body.message === "string"
      ) {
        throw new ErrTyp(body.message, {
          httpCode: res.status,
          httpMessage: res.statusText,
        });
      } else if (
        body &&
        typeof body === "object" &&
        "detail" in body &&
        typeof body.detail === "string"
      ) {
        throw new ErrTyp(body.detail, {
          httpCode: res.status,
          httpMessage: res.statusText,
        });
      } else {
        throw new ErrTyp("Unknown server error", {
          httpCode: res.status,
          httpMessage: res.statusText,
        });
      }
    }
  } else {
    throw new ErrTyp(`Server responded with ${res.status} ${res.statusText}`, {
      httpCode: res.status,
      httpMessage: res.statusText,
    });
  }
};
