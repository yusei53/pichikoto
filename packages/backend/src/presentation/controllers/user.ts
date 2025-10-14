import type { GetAllUsersResponse } from "@pichikoto/http-contracts";
import type { Context } from "hono";
import type { GetAllUsersUseCase } from "../../application/use-case/user/GetAllUsersUseCase";

export interface UserControllerInterface {
  getAllUsers(c: Context): Promise<Response>;
}

export class UserController implements UserControllerInterface {
  constructor(private readonly getAllUsersUseCase: GetAllUsersUseCase) {}

  async getAllUsers(c: Context): Promise<Response> {
    const users = await this.getAllUsersUseCase.execute();

    const response: GetAllUsersResponse = {
      users: users.map((user) => ({
        discordUserID: user.discordUserID.value,
        discordUserName: user.discordUserName,
        discordGlobalName: user.discordGlobalName,
        discordAvatar: user.discordAvatar
      }))
    };

    return c.json(response);
  }
}
