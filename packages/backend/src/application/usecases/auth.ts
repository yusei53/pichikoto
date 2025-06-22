import type { Context } from "hono";
import { inject, injectable } from "inversify";
import { DiscordID, User } from "../../domain/models/User";
import { UserAuth } from "../../domain/models/UserAuth";
import type { IUserRepository } from "../../domain/repositories/user";
import type { IUserAuthRepository } from "../../domain/repositories/userAuth";
import type { IDiscordAuthService } from "../../domain/services/discord-auth";
import { TYPES } from "../../infrastructure/config/types";
import type { AuthPayloadDTO } from "../dtos/auth.dto";

export interface IAuthUsecase {
  redirect(c: Context, code: string): Promise<AuthPayloadDTO>;
}

@injectable()
export class AuthUsecase implements IAuthUsecase {
  constructor(
    @inject(TYPES.DiscordAuthService)
    private readonly discordAuthService: IDiscordAuthService,
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
    @inject(TYPES.UserAuthRepository)
    private readonly userAuthRepository: IUserAuthRepository
  ) {}

  async redirect(c: Context, code: string): Promise<AuthPayloadDTO> {
    const authorizationResponse = await this.discordAuthService.authorization(
      c,
      code
    );

    const discordUserResource = await this.discordAuthService.getUserResource(
      c,
      authorizationResponse.access_token
    );

    const existsUser = await this.userRepository.getByDiscordID(
      DiscordID.from(discordUserResource.id)
    );
    if (existsUser) {
      // MEMO: 既にユーザーが存在する場合はログインとして処理
    }

    const user = User.create(
      DiscordID.from(discordUserResource.id),
      discordUserResource.username,
      discordUserResource.discriminator,
      discordUserResource.avatar,
      null, // MEMO: OAuth時にユーザーからの入力は受け取れないのでnull
      null
    );
    await this.userRepository.save(user);

    const userAuth = UserAuth.create(
      user.userID,
      authorizationResponse.access_token,
      authorizationResponse.refresh_token,
      authorizationResponse.expires_in,
      authorizationResponse.scope,
      authorizationResponse.token_type
    );
    await this.userAuthRepository.save(userAuth);

    // TODO: サインアップ処理

    return {
      user: {
        id: "dummy-user-id",
        discordUserName: "dummy-user",
        discordAvatar: "",
        faculty: "dummy-faculty",
        department: "dummy-department"
      },
      token: "dummy-jwt-token"
    };
  }
}
