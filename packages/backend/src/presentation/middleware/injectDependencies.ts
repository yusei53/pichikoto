import type { MiddlewareHandler } from "hono";
import { container } from "../../infrastructure/config/inversify.config";
import { TYPES } from "../../infrastructure/config/types";
import type { IAuthController } from "../controllers/auth";

export const injectDependencies: MiddlewareHandler = async (c, next) => {
  const authController = container.get<IAuthController>(TYPES.AuthController);
  c.set("diContainer", container);
  c.set("authController", authController);
  await next();
};
