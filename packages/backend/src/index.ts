import {
  BadRequestError,
  HttpError,
  InternalServerError
} from "@pichikoto/http-contracts";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import "reflect-metadata";
import z from "zod";
import type { container } from "./di-container/inversify.config";
import type { AuthControllerInterface } from "./presentation/controllers/auth";
import { injectDependencies } from "./presentation/middleware/injectDependencies";
import { auth } from "./presentation/routes/auth";

export type Variables = {
  diContainer: typeof container;
  authController: AuthControllerInterface;
};

export type Env = {
  NODE_ENV: string;
  DATABASE_URL: string;
  DISCORD_AUTH_URL: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  BASE_URL: string;
  JWT_SECRET: string;
  FRONTEND_BASE_URL: string;
};

const app = new Hono<{ Variables: Variables; Bindings: Env }>().basePath(
  "/api"
);

app.use("*", async (c, next) => {
  const origin = c.env.FRONTEND_BASE_URL;
  const corsMiddlewareHandler = cors({
    origin,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true
  });
  return corsMiddlewareHandler(c, next);
});
app.use("*", injectDependencies);
app.use("*", logger());

app.onError((err, c) => {
  if (err instanceof HttpError) {
    if (c.env.NODE_ENV === "development") {
      console.error(`${err.name}: ${String(err.cause)}`);
    }
    return createJsonResponse(err.status, err.message);
  }

  if (err instanceof z.ZodError) {
    const badRequest = new BadRequestError(err.message);
    if (c.env.NODE_ENV === "development") {
      console.error(`${badRequest.name}: ${String(badRequest.cause)}`);
    }
    return createJsonResponse(badRequest.status, badRequest.message);
  }

  const internal = new InternalServerError(err);
  if (c.env.NODE_ENV === "development") {
    console.error(`${internal.name}: ${String(internal.cause)}`);
  }
  return createJsonResponse(internal.status, internal.message);
});

app.route("/auth", auth);

export default app;

const createJsonResponse = (status: number, message: string): Response => {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
};
