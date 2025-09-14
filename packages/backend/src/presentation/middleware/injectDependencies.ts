import type { MiddlewareHandler } from "hono";
import type { DbClientInterface } from "../../../database/client";
import { container } from "../../infrastructure/config/inversify.config";
import { TYPES } from "../../infrastructure/config/types";
import type { AuthControllerInterface } from "../controllers/auth";

export const injectDependencies: MiddlewareHandler = async (c, next) => {
  const dbClient = container.get<DbClientInterface>(TYPES.DbClient);
  dbClient.init(c);

  const authController = container.get<AuthControllerInterface>(
    TYPES.AuthController
  );
  c.set("diContainer", container);
  c.set("authController", authController);

  await next();
};
