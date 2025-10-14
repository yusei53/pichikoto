import type { CallbackResponse } from "@pichikoto/http-contracts";
import type { Context } from "hono";
import { DiscordTokens } from "../../../domain/discord-tokens/DiscordTokens";
import { DiscordUserID, User } from "../../../domain/user/User";
import type { DiscordTokensRepositoryInterface } from "../../../infrastructure/repositories/DiscordTokensRepository";
import type { UserRepositoryInterface } from "../../../infrastructure/repositories/UserRepository";
import { handleResult } from "../../../utils/ResultHelper";
import type { DiscordOAuthFlowServiceInterface } from "../../services/discord-auth/DiscordOAuthFlowService";
import type { DiscordTokenServiceInterface } from "../../services/discord-auth/DiscordTokenService";
import type { DiscordUserServiceInterface } from "../../services/discord-auth/DiscordUserService";
import type { JwtGenerateServiceInterface } from "../../services/jwt/JwtGenerateService";

export interface DiscordAuthCallbackUseCaseInterface {
  execute(
    c: Context,
    code: string,
    state: string,
    sessionId: string
  ): Promise<CallbackResponse>;
}

export class DiscordAuthCallbackUseCase
  implements DiscordAuthCallbackUseCaseInterface
{
  constructor(
    private readonly oauthFlowService: DiscordOAuthFlowServiceInterface,
    private readonly discordTokenService: DiscordTokenServiceInterface,
    private readonly discordUserService: DiscordUserServiceInterface,
    private readonly userRepository: UserRepositoryInterface,
    private readonly discordTokensRepository: DiscordTokensRepositoryInterface,
    private readonly jwtGenerateService: JwtGenerateServiceInterface
  ) {}

  async execute(
    c: Context,
    code: string,
    state: string,
    sessionId: string
  ): Promise<CallbackResponse> {
    const { nonce, codeVerifier } = handleResult(
      await this.oauthFlowService.verifyStateBySessionID(sessionId, state),
      (error) => new DiscordAuthCallbackUseCaseError(error)
    );

    const discordToken = handleResult(
      await this.discordTokenService.exchangeCodeForTokens(
        c,
        code,
        codeVerifier
      ),
      (error) => new DiscordAuthCallbackUseCaseError(error)
    );

    const idTokenPayload = handleResult(
      await this.discordTokenService.verifyIdToken(
        c,
        discordToken.id_token,
        nonce
      ),
      (error) => new DiscordAuthCallbackUseCaseError(error)
    );

    const discordUserResource = handleResult(
      await this.discordUserService.getUserResource(discordToken.access_token),
      (error) => new DiscordAuthCallbackUseCaseError(error)
    );

    if (idTokenPayload.sub !== discordUserResource.id) {
      throw new DiscordAuthCallbackUseCaseError(
        new Error("User ID mismatch between ID token and API response")
      );
    }

    const existsUser = await this.userRepository.findBy(
      DiscordUserID.from(discordUserResource.id)
    );

    if (existsUser) {
      const discordTokens = await this.discordTokensRepository.findBy(
        existsUser.discordUserID
      );
      if (discordTokens === null) {
        throw new DiscordAuthCallbackUseCaseError(
          new Error("DiscordTokens not found")
        );
      }

      const jwtResult = await this.jwtGenerateService.execute(
        c,
        existsUser.discordUserID.value
      );
      if (jwtResult.isErr()) {
        throw new DiscordAuthCallbackUseCaseError(jwtResult.error);
      }
      const { accessToken, refreshToken } = jwtResult.value;
      return { accessToken, refreshToken };
    }

    const user = User.create(
      DiscordUserID.from(discordUserResource.id),
      discordUserResource.username,
      discordUserResource.avatar
    );
    await this.userRepository.save(user);

    const discordTokens = DiscordTokens.create(
      user.discordUserID,
      discordToken.access_token,
      discordToken.refresh_token,
      discordToken.expires_in,
      discordToken.scope,
      discordToken.token_type
    );
    await this.discordTokensRepository.save(discordTokens);

    const jwtResult = await this.jwtGenerateService.execute(
      c,
      user.discordUserID.value
    );
    if (jwtResult.isErr()) {
      throw new DiscordAuthCallbackUseCaseError(jwtResult.error);
    }
    const { accessToken, refreshToken } = jwtResult.value;

    return { accessToken, refreshToken };
  }
}

class DiscordAuthCallbackUseCaseError extends Error {
  readonly name = this.constructor.name;
  constructor(cause: Error) {
    super(
      `DiscordAuthCallbackUseCaseError(cause: ${cause.name}: ${cause.message})`
    );
  }
}
