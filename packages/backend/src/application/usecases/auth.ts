import type { Context } from "hono";
import { inject, injectable } from "inversify";
import { DiscordID, User } from "../../domain/models/User";
import { UserAuth } from "../../domain/models/UserAuth";
import type { IUserRepository } from "../../domain/repositories/user";
import type { IUserAuthRepository } from "../../domain/repositories/userAuth";
import type { IDiscordAuthService } from "../../domain/services/discord-auth";
import type { IJwtService } from "../../domain/services/jwt";
import { TYPES } from "../../infrastructure/config/types";
import { toAuthPayloadDTO, type AuthPayloadDTO } from "../dtos/auth.dto";

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
    private readonly userAuthRepository: IUserAuthRepository,
    @inject(TYPES.JwtService)
    private readonly jwtService: IJwtService
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

    const existsUser = await this.userRepository.findBy(
      DiscordID.from(discordUserResource.id)
    );
    // MEMO: 既にユーザーが存在する場合はログインとして処理
    if (existsUser !== null) {
      const userAuth = await this.userAuthRepository.findBy(existsUser.userID);
      if (!userAuth) {
        throw new Error("UserAuth not found");
      }
      const { accessToken, refreshToken } =
        await this.jwtService.generateTokens(c, existsUser.userID.value.value);
      return toAuthPayloadDTO(existsUser, accessToken, refreshToken);
    }

    // MEMO: 新規ユーザーの場合はサインアップ
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

    const { accessToken, refreshToken } = await this.jwtService.generateTokens(
      c,
      user.userID.value.value
    );

    return toAuthPayloadDTO(user, accessToken, refreshToken);
  }
}
