import type { MiddlewareHandler } from "hono";
import { container } from "../../infrastructure/config/inversify.config";
import { TYPES } from "../../infrastructure/config/types";
import type { IDbClient } from "../../infrastructure/database/connection";
import type { IAuthController } from "../controllers/auth";

export const injectDependencies: MiddlewareHandler = async (c, next) => {
  const dbClient = container.get<IDbClient>(TYPES.DbClient);
  dbClient.init(c);

  const authController = container.get<IAuthController>(TYPES.AuthController);
  c.set("diContainer", container);
  c.set("authController", authController);

  await next();
};
