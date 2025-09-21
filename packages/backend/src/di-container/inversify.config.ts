import { Container } from "inversify";
import type { DbClientInterface } from "../../database/client";
import { DbClient } from "../../database/client";
import type { DiscordJWKServiceInterface } from "../application/services/discord-auth/DiscordJWKService";
import { DiscordJWKService } from "../application/services/discord-auth/DiscordJWKService";
import type { DiscordOAuthFlowServiceInterface } from "../application/services/discord-auth/DiscordOAuthFlowService";
import { DiscordOAuthFlowService } from "../application/services/discord-auth/DiscordOAuthFlowService";
import type { DiscordTokenServiceInterface } from "../application/services/discord-auth/DiscordTokenService";
import { DiscordTokenService } from "../application/services/discord-auth/DiscordTokenService";
import type { DiscordUserServiceInterface } from "../application/services/discord-auth/DiscordUserService";
import { DiscordUserService } from "../application/services/discord-auth/DiscordUserService";
import type { JwtServiceInterface } from "../application/services/jwt/jwt";
import { JwtService } from "../application/services/jwt/jwt";
import type { JwtVerifyServiceInterface } from "../application/services/jwt/JWTVerifyService";
import { JwtVerifyService } from "../application/services/jwt/JWTVerifyService";
import type { DiscordAuthCallbackUseCaseInterface } from "../application/use-case/discord-auth/DiscordAuthCallbackUseCase";
import { DiscordAuthCallbackUseCase } from "../application/use-case/discord-auth/DiscordAuthCallbackUseCase";
import type { DiscordAuthInitiateUseCaseInterface } from "../application/use-case/discord-auth/DiscordAuthInitiateUseCase";
import { DiscordAuthInitiateUseCase } from "../application/use-case/discord-auth/DiscordAuthInitiateUseCase";
import type { DiscordAuthVerifyUseCaseInterface } from "../application/use-case/discord-auth/DiscordAuthVerifyUseCase.js";
import { DiscordAuthVerifyUseCase } from "../application/use-case/discord-auth/DiscordAuthVerifyUseCase.js";
import type { DiscordTokensRepositoryInterface } from "../infrastructure/repositories/DiscordTokensRepository";
import { DiscordTokensRepository } from "../infrastructure/repositories/DiscordTokensRepository";
import type { StateRepositoryInterface } from "../infrastructure/repositories/StateRepository";
import { StateRepository } from "../infrastructure/repositories/StateRepository";
import type { UserRepositoryInterface } from "../infrastructure/repositories/UserRepository";
import { UserRepository } from "../infrastructure/repositories/UserRepository";
import type { AuthControllerInterface } from "../presentation/controllers/auth";
import { AuthController } from "../presentation/controllers/auth";
import { TYPES } from "./types";

const container = new Container();

// Infrastructure
container
  .bind<DbClientInterface>(TYPES.DbClient)
  .to(DbClient)
  .inSingletonScope();

// Repositories
container
  .bind<UserRepositoryInterface>(TYPES.UserRepository)
  .to(UserRepository)
  .inRequestScope();
container
  .bind<DiscordTokensRepositoryInterface>(TYPES.DiscordTokensRepository)
  .to(DiscordTokensRepository)
  .inRequestScope();
container
  .bind<StateRepositoryInterface>(TYPES.StateRepository)
  .to(StateRepository)
  .inRequestScope();

// Services
container
  .bind<JwtServiceInterface>(TYPES.JwtService)
  .to(JwtService)
  .inSingletonScope();
container
  .bind<DiscordOAuthFlowServiceInterface>(TYPES.DiscordOAuthFlowService)
  .to(DiscordOAuthFlowService)
  .inRequestScope();
container
  .bind<DiscordTokenServiceInterface>(TYPES.DiscordTokenService)
  .to(DiscordTokenService)
  .inSingletonScope();
container
  .bind<DiscordUserServiceInterface>(TYPES.DiscordUserService)
  .to(DiscordUserService)
  .inSingletonScope();
container
  .bind<DiscordJWKServiceInterface>(TYPES.DiscordJWKService)
  .to(DiscordJWKService)
  .inSingletonScope();
container
  .bind<JwtVerifyServiceInterface>(TYPES.JwtVerifyService)
  .to(JwtVerifyService)
  .inRequestScope();

// Usecases
container
  .bind<DiscordAuthCallbackUseCaseInterface>(TYPES.DiscordAuthCallbackUseCase)
  .to(DiscordAuthCallbackUseCase)
  .inRequestScope();
container
  .bind<DiscordAuthInitiateUseCaseInterface>(TYPES.DiscordAuthInitiateUseCase)
  .to(DiscordAuthInitiateUseCase)
  .inRequestScope();
container
  .bind<DiscordAuthVerifyUseCaseInterface>(TYPES.DiscordAuthVerifyUseCase)
  .to(DiscordAuthVerifyUseCase)
  .inRequestScope();

// Controllers
container
  .bind<AuthControllerInterface>(TYPES.AuthController)
  .to(AuthController)
  .inRequestScope();

export { container };
