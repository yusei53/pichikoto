import {
  HttpError,
  InternalServerError
} from "@pichikoto/http-contracts/utils";
import type { Context } from "hono";

type ControllerHandler = (ctx: Context) => Promise<Response>;

const createJsonResponse = (status: number, message: string): Response => {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
};

export const withHttpErrorHandling = async (
  c: Context,
  handler: ControllerHandler
): Promise<Response> => {
  try {
    return await handler(c);
  } catch (error) {
    if (error instanceof HttpError) {
      if (c.env.NODE_ENV === "development") {
        console.error(`${error.name}: ${String(error.cause)}`);
      }
      return createJsonResponse(error.status, error.message);
    }

    const err = new InternalServerError(error);
    if (c.env.NODE_ENV === "development") {
      console.error(`${err.name}: ${String(err.cause)}`);
    }
    return createJsonResponse(err.status, err.message);
  }
};
