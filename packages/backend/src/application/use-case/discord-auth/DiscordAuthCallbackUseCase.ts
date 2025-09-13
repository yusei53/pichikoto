import type { Context } from "hono";
import { inject, injectable } from "inversify";
import { DiscordTokens } from "../../../domain/discord-tokens/DiscordTokens";
import { DiscordID, User } from "../../../domain/user/User";
import { TYPES } from "../../../infrastructure/config/types";
import type { DiscordTokensRepositoryInterface } from "../../../infrastructure/repositories/DiscordTokensRepository";
import type { UserRepositoryInterface } from "../../../infrastructure/repositories/UserRepository";
import { handleResult } from "../../../utils/ResultHelper";
import { toAuthPayloadDTO, type AuthPayloadDTO } from "../../dtos/auth.dto";
import type { DiscordOAuthFlowServiceInterface } from "../../services/discord-auth/DiscordOAuthFlowService";
import type { DiscordTokenServiceInterface } from "../../services/discord-auth/DiscordTokenService";
import type { DiscordUserServiceInterface } from "../../services/discord-auth/DiscordUserService";
import type { JwtServiceInterface } from "../../services/jwt";

export interface DiscordAuthCallbackUseCaseInterface {
  execute(
    c: Context,
    code: string,
    state: string,
    sessionId: string
  ): Promise<AuthPayloadDTO>;
}

@injectable()
export class DiscordAuthCallbackUseCase
  implements DiscordAuthCallbackUseCaseInterface
{
  constructor(
    @inject(TYPES.DiscordOAuthFlowService)
    private readonly oauthFlowService: DiscordOAuthFlowServiceInterface,
    @inject(TYPES.DiscordTokenService)
    private readonly discordTokenService: DiscordTokenServiceInterface,
    @inject(TYPES.DiscordUserService)
    private readonly discordUserService: DiscordUserServiceInterface,
    @inject(TYPES.UserRepository)
    private readonly userRepository: UserRepositoryInterface,
    @inject(TYPES.DiscordTokensRepository)
    private readonly discordTokensRepository: DiscordTokensRepositoryInterface,
    @inject(TYPES.JwtService)
    private readonly jwtService: JwtServiceInterface
  ) {}

  async execute(
    c: Context,
    code: string,
    state: string,
    sessionId: string
  ): Promise<AuthPayloadDTO> {
    const { nonce, codeVerifier } = handleResult(
      await this.oauthFlowService.verifyStateBySessionID(sessionId, state),
      (error) => new AuthenticationUseCaseError(error)
    );

    const tokenResponse = handleResult(
      await this.discordTokenService.exchangeCodeForTokens(
        c,
        code,
        codeVerifier
      ),
      (error) => new AuthenticationUseCaseError(error)
    );

    const idTokenPayload = handleResult(
      await this.discordTokenService.verifyIdToken(
        c,
        tokenResponse.id_token,
        nonce
      ),
      (error) => new AuthenticationUseCaseError(error)
    );
    console.log("ID token verification successful:", {
      sub: idTokenPayload.sub
    });

    const discordUserResource = handleResult(
      await this.discordUserService.getUserResource(tokenResponse.access_token),
      (error) => new AuthenticationUseCaseError(error)
    );

    if (idTokenPayload.sub !== discordUserResource.id) {
      throw new Error("User ID mismatch between ID token and API response");
    }

    const existsUser = await this.userRepository.findBy(
      DiscordID.from(discordUserResource.id)
    );

    if (existsUser !== null) {
      const discordTokens = await this.discordTokensRepository.findBy(
        existsUser.userID
      );
      if (!discordTokens) {
        throw new Error("DiscordTokens not found");
      }
      const { accessToken, refreshToken } =
        await this.jwtService.generateTokens(c, existsUser.userID.value.value);
      return toAuthPayloadDTO(existsUser, accessToken, refreshToken);
    }

    const user = User.create(
      DiscordID.from(discordUserResource.id),
      discordUserResource.username,
      discordUserResource.avatar,
      null,
      null
    );
    await this.userRepository.save(user);

    const discordTokens = DiscordTokens.create(
      user.userID,
      tokenResponse.access_token,
      tokenResponse.refresh_token,
      tokenResponse.expires_in,
      tokenResponse.scope,
      tokenResponse.token_type
    );
    await this.discordTokensRepository.save(discordTokens);

    const { accessToken, refreshToken } = await this.jwtService.generateTokens(
      c,
      user.userID.value.value
    );

    return toAuthPayloadDTO(user, accessToken, refreshToken);
  }
}

class AuthenticationUseCaseError extends Error {
  readonly name = this.constructor.name;
  constructor(cause: Error) {
    super(`AuthenticationUseCaseError(cause: ${cause.name}: ${cause.message})`);
  }
}
