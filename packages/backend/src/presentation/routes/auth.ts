import type { Context } from "hono";
import { Hono } from "hono";
import { DbClient } from "../../../database/client";
import { DiscordJWKService } from "../../application/services/discord-auth/DiscordJWKService";
import { DiscordOAuthFlowService } from "../../application/services/discord-auth/DiscordOAuthFlowService";
import { DiscordTokenService } from "../../application/services/discord-auth/DiscordTokenService";
import { DiscordUserService } from "../../application/services/discord-auth/DiscordUserService";
import { JwtGenerateService } from "../../application/services/jwt/JwtGenerateService";
import { JwtVerifyService } from "../../application/services/jwt/JWTVerifyService";
import { DiscordAuthCallbackUseCase } from "../../application/use-case/discord-auth/DiscordAuthCallbackUseCase";
import { DiscordAuthInitiateUseCase } from "../../application/use-case/discord-auth/DiscordAuthInitiateUseCase";
import { DiscordAuthVerifyUseCase } from "../../application/use-case/discord-auth/DiscordAuthVerifyUseCase";
import { JwtRefreshTokenUseCase } from "../../application/use-case/discord-auth/JwtRefreshTokenUseCase";
import { DiscordTokensRepository } from "../../infrastructure/repositories/DiscordTokensRepository";
import { StateRepository } from "../../infrastructure/repositories/StateRepository";
import { UserRepository } from "../../infrastructure/repositories/UserRepository";
import { AuthController } from "../controllers/auth";

const authControllerFactory = (c: Context) => {
  const dbClient = new DbClient();
  dbClient.init(c);

  const stateRepository = new StateRepository();
  const discordTokensRepository = new DiscordTokensRepository();
  const userRepository = new UserRepository();

  const discordJwkService = new DiscordJWKService();
  const discordTokenService = new DiscordTokenService(discordJwkService);
  const discordUserService = new DiscordUserService();
  const discordOAuthFlowService = new DiscordOAuthFlowService(stateRepository);

  const jwtVerifyService = new JwtVerifyService();
  const jwtGenerateService = new JwtGenerateService();

  const discordAuthInitiateUseCase = new DiscordAuthInitiateUseCase(
    stateRepository
  );
  const discordAuthCallbackUseCase = new DiscordAuthCallbackUseCase(
    discordOAuthFlowService,
    discordTokenService,
    discordUserService,
    userRepository,
    discordTokensRepository,
    jwtGenerateService
  );
  const jwtRefreshTokenUseCase = new JwtRefreshTokenUseCase(jwtVerifyService);
  const discordAuthVerifyUseCase = new DiscordAuthVerifyUseCase(
    jwtVerifyService
  );

  return new AuthController(
    discordAuthInitiateUseCase,
    discordAuthCallbackUseCase,
    jwtRefreshTokenUseCase,
    discordAuthVerifyUseCase
  );
};

export const auth = new Hono<{ Bindings: Env }>();

auth.get("/", async (c) => {
  const controller = authControllerFactory(c);
  return controller.redirectToAuthURL(c);
});

auth.post("/callback", async (c) => {
  const controller = authControllerFactory(c);
  return controller.callback(c);
});

auth.post("/refresh", async (c) => {
  const controller = authControllerFactory(c);
  return controller.refresh(c);
});

auth.get("/is-authorized", async (c) => {
  const controller = authControllerFactory(c);
  return controller.verify(c);
});
