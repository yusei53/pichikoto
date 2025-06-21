import { Hono } from "hono";
import { logger } from "hono/logger";
import "reflect-metadata";
import type { container } from "./infrastructure/config/inversify.config";
import type { IAuthController } from "./presentation/controllers/auth";
import { injectDependencies } from "./presentation/middleware/injectDependencies";
import { auth } from "./presentation/routes/auth";

export type Variables = {
  diContainer: typeof container;
  authController: IAuthController;
};

const app = new Hono<{ Variables: Variables }>().basePath("/api");

app.use("*", injectDependencies);
app.use("*", logger());

app.route("/auth", auth);

export default app;
