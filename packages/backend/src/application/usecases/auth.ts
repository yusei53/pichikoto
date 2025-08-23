import type { Context } from "hono";
import { inject, injectable } from "inversify";

import { DiscordID, User } from "../../domain/User";
import { UserAuth } from "../../domain/UserAuth";
import { TYPES } from "../../infrastructure/config/types";
import type { UserAuthRepositoryInterface } from "../../infrastructure/repositories/UserAuthRepository";
import type { UserRepositoryInterface } from "../../infrastructure/repositories/UserRepository";
import { toAuthPayloadDTO, type AuthPayloadDTO } from "../dtos/auth.dto";
import type { DiscordOIDCServiceInterface } from "../services/discord-oidc";
import type { JwtServiceInterface } from "../services/jwt";

export interface AuthUsecaseInterface {
  callback(c: Context, code: string, state: string, sessionId: string): Promise<AuthPayloadDTO>;
}

@injectable()
export class AuthUsecase implements AuthUsecaseInterface {
  constructor(
    @inject(TYPES.DiscordOIDCService)
    private readonly discordOIDCService: DiscordOIDCServiceInterface,
    @inject(TYPES.UserRepository)
    private readonly userRepository: UserRepositoryInterface,
    @inject(TYPES.UserAuthRepository)
    private readonly userAuthRepository: UserAuthRepositoryInterface,
    @inject(TYPES.JwtService)
    private readonly jwtService: JwtServiceInterface
  ) {}

  async callback(c: Context, code: string, state: string, sessionId: string): Promise<AuthPayloadDTO> {
  // sessionIdとstateパラメータの検証
  const isValidState = await this.discordOIDCService.verifyStateBySessionId(c, sessionId, state);
  if (!isValidState) {
    console.error("Invalid or expired state parameter:", { sessionId, state });
    throw new Error("Invalid or expired state parameter");
  }

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
  
  if (existsUser !== null) {
    const userAuth = await this.userAuthRepository.findBy(existsUser.userID);
    if (!userAuth) {
      throw new Error("UserAuth not found");
    }
    const { accessToken, refreshToken } =
      await this.jwtService.generateTokens(c, existsUser.userID.value.value);
    return toAuthPayloadDTO(existsUser, accessToken, refreshToken);
  }

  const user = User.create(
    DiscordID.from(discordUserResource.id),
    discordUserResource.username,
    discordUserResource.discriminator,
    discordUserResource.avatar,
    null,
    null
  );
  await this.userRepository.save(user);

  const userAuth = UserAuth.create(
    user.userID,
    tokenResponse.access_token,
    tokenResponse.refresh_token,
    tokenResponse.expires_in,
    tokenResponse.scope,
    tokenResponse.token_type
  );
  await this.userAuthRepository.save(userAuth);

  const { accessToken, refreshToken } = await this.jwtService.generateTokens(
    c,
    user.userID.value.value
  );

  return toAuthPayloadDTO(user, accessToken, refreshToken);
}
}
