import {
  InternalServerError,
  type GetAllUsersResponse,
  type HttpError
} from "@pichikoto/http-contracts";
import type { Context } from "hono";
import type { GetAllUsersUseCase } from "../../application/use-case/user/GetAllUsersUseCase";
import { DiscordUserID } from "../../domain/user/User";
import type {
  UserInfoQueryService,
  UserInfoQueryServiceError
} from "../../query-service/UserInfoQueryService";
import { HttpErrorResponseCreator } from "../../utils/ResponseCreator";

export interface UserControllerInterface {
  getAllUsers(c: Context): Promise<Response>;
  getUserInfo(c: Context): Promise<Response>;
}

export class UserController implements UserControllerInterface {
  constructor(
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly getUserInfoUseCase: UserInfoQueryService
  ) {}

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

  async getUserInfo(c: Context): Promise<Response> {
    const responseCreator = new UserInfoQueryServiceErrorResponseCreator();

    const discordUserID = c.req.param("discordUserID");
    const userInfo = await this.getUserInfoUseCase.getUserInfo(
      DiscordUserID.from(discordUserID)
    );

    return responseCreator.fromResult(userInfo).respond(c);
  }
}

export class UserInfoQueryServiceErrorResponseCreator extends HttpErrorResponseCreator<UserInfoQueryServiceError> {
  protected createHttpError(error: UserInfoQueryServiceError): HttpError {
    return new InternalServerError(error.message, "UserInfoQueryServiceError");
  }
}
