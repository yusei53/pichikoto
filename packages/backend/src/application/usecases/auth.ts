import type { Context } from "hono";
import { inject, injectable } from "inversify";

import { DiscordToken } from "../../domain/DiscordToken";
import { DiscordID, User } from "../../domain/User";
import { TYPES } from "../../infrastructure/config/types";

import type { DiscordTokenRepositoryInterface } from "../../infrastructure/repositories/DiscordTokenRepository";
import type { UserRepositoryInterface } from "../../infrastructure/repositories/UserRepository";
import { toAuthPayloadDTO, type AuthPayloadDTO } from "../dtos/auth.dto";
import type { DiscordOIDCServiceInterface } from "../services/discord-oidc";
import type { JwtServiceInterface } from "../services/jwt";

export interface AuthUsecaseInterface {
  callback(c: Context, code: string): Promise<AuthPayloadDTO>;
}

@injectable()
export class AuthUsecase implements AuthUsecaseInterface {
  constructor(
    @inject(TYPES.DiscordOIDCService)
    private readonly discordOIDCService: DiscordOIDCServiceInterface,
    @inject(TYPES.UserRepository)
    private readonly userRepository: UserRepositoryInterface,
    @inject(TYPES.DiscordTokenRepository)
    private readonly discordTokenRepository: DiscordTokenRepositoryInterface,
    @inject(TYPES.JwtService)
    private readonly jwtService: JwtServiceInterface
  ) {}

  async callback(c: Context, code: string): Promise<AuthPayloadDTO> {
    const tokenResponse = await this.discordOIDCService.exchangeCodeForTokens(
      c,
      code
    );

    if (!tokenResponse.id_token) {
      throw new Error("ID token not received from Discord OIDC");
    }

    const idTokenPayload = await this.discordOIDCService.verifyIdToken(
      c,
      tokenResponse.id_token
    );
    console.log("ID token verification successful:", {
      sub: idTokenPayload.sub
    });

    const discordUserResource = await this.discordOIDCService.getUserResource(
      c,
      tokenResponse.access_token
    );

    if (idTokenPayload.sub !== discordUserResource.id) {
      throw new Error("User ID mismatch between ID token and API response");
    }

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
      tokenResponse.access_token,
      tokenResponse.refresh_token,
      tokenResponse.expires_in,
      tokenResponse.scope,
      tokenResponse.token_type
    );
    await this.discordTokenRepository.save(discordToken);

    const { accessToken, refreshToken } = await this.jwtService.generateTokens(
      c,
      user.userID.value.value
    );

    return toAuthPayloadDTO(user, accessToken, refreshToken);
  }
}
