import type { Context } from "hono";
import { Hono } from "hono";
import { DbClient } from "../../../database/client";
import { GetAllUsersUseCase } from "../../application/use-case/user/GetAllUsersUseCase";
import { UserRepository } from "../../infrastructure/repositories/UserRepository";
import { UserInfoQueryService } from "../../query-service/UserInfoQUeryService";
import { UserController } from "../controllers/user";

const userControllerFactory = (c: Context) => {
  const dbClient = new DbClient();
  dbClient.init(c);

  const userRepository = new UserRepository();
  const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
  const getUserInfoUseCase = new UserInfoQueryService();

  return new UserController(getAllUsersUseCase, getUserInfoUseCase);
};

export const user = new Hono<{ Bindings: Env }>();

user.get("/", async (c) => {
  const controller = userControllerFactory(c);
  return controller.getAllUsers(c);
});

user.get("/:discordUserID", async (c) => {
  const controller = userControllerFactory(c);
  return controller.getUserInfo(c);
});
