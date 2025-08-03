import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import "reflect-metadata";
import type { container } from "./infrastructure/config/inversify.config";
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
  console.log("origin", origin);
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

app.route("/auth", auth);

export default app;
