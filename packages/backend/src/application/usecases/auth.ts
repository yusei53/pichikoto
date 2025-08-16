import type { Context } from "hono";
import { inject, injectable } from "inversify";

import { DiscordToken } from "../../domain/DiscordToken";
import { DiscordID, User } from "../../domain/User";
import { TYPES } from "../../infrastructure/config/types";

import type { DiscordTokenRepositoryInterface } from "../../infrastructure/repositories/DiscordTokenRepository";
import type { UserRepositoryInterface } from "../../infrastructure/repositories/UserRepository";
import { toAuthPayloadDTO, type AuthPayloadDTO } from "../dtos/auth.dto";
import type { DiscordAuthServiceInterface } from "../services/discord-auth";
import type { JwtServiceInterface } from "../services/jwt";

export interface AuthUsecaseInterface {
  callback(c: Context, code: string): Promise<AuthPayloadDTO>;
}

@injectable()
export class AuthUsecase implements AuthUsecaseInterface {
  constructor(
    @inject(TYPES.DiscordAuthService)
    private readonly discordAuthService: DiscordAuthServiceInterface,
    @inject(TYPES.UserRepository)
    private readonly userRepository: UserRepositoryInterface,
    @inject(TYPES.DiscordTokenRepository)
    private readonly discordTokenRepository: DiscordTokenRepositoryInterface,
    @inject(TYPES.JwtService)
    private readonly jwtService: JwtServiceInterface
  ) {}

  async callback(c: Context, code: string): Promise<AuthPayloadDTO> {
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
      const userAuth = await this.discordTokenRepository.findBy(
        existsUser.userID
      );
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
      discordUserResource.avatar,
      null, // MEMO: OAuth時にユーザーからの入力は受け取れないのでnull
      null
    );
    await this.userRepository.save(user);

    const discordToken = DiscordToken.create(
      user.userID,
      authorizationResponse.access_token,
      authorizationResponse.refresh_token,
      authorizationResponse.expires_in,
      authorizationResponse.scope,
      authorizationResponse.token_type
    );
    await this.discordTokenRepository.save(discordToken);

    const { accessToken, refreshToken } = await this.jwtService.generateTokens(
      c,
      user.userID.value.value
    );

    return toAuthPayloadDTO(user, accessToken, refreshToken);
  }
}
