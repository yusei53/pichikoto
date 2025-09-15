import { Container } from "inversify";
import type { DbClientInterface } from "../../../database/client";
import { DbClient } from "../../../database/client";
import type { DiscordJWKServiceInterface } from "../../application/services/discord-auth/DiscordJWKService";
import { DiscordJWKService } from "../../application/services/discord-auth/DiscordJWKService";
import type { DiscordOAuthFlowServiceInterface } from "../../application/services/discord-auth/DiscordOAuthFlowService";
import { DiscordOAuthFlowService } from "../../application/services/discord-auth/DiscordOAuthFlowService";
import type { DiscordTokenServiceInterface } from "../../application/services/discord-auth/DiscordTokenService";
import { DiscordTokenService } from "../../application/services/discord-auth/DiscordTokenService";
import type { DiscordUserServiceInterface } from "../../application/services/discord-auth/DiscordUserService";
import { DiscordUserService } from "../../application/services/discord-auth/DiscordUserService";
import type { JwtServiceInterface } from "../../application/services/jwt";
import { JwtService } from "../../application/services/jwt";
import type { DiscordAuthCallbackUseCaseInterface } from "../../application/use-case/discord-auth/DiscordAuthCallbackUseCase";
import { DiscordAuthCallbackUseCase } from "../../application/use-case/discord-auth/DiscordAuthCallbackUseCase";
import type { DiscordAuthInitiateUseCaseInterface } from "../../application/use-case/discord-auth/DiscordAuthInitiateUseCase";
import { DiscordAuthInitiateUseCase } from "../../application/use-case/discord-auth/DiscordAuthInitiateUseCase";
import type { AuthControllerInterface } from "../../presentation/controllers/auth";
import { AuthController } from "../../presentation/controllers/auth";
import type { DiscordTokensRepositoryInterface } from "../repositories/DiscordTokensRepository";
import { DiscordTokensRepository } from "../repositories/DiscordTokensRepository";
import type { StateRepositoryInterface } from "../repositories/StateRepository";
import { StateRepository } from "../repositories/StateRepository";
import type { UserRepositoryInterface } from "../repositories/UserRepository";
import { UserRepository } from "../repositories/UserRepository";
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
  .bind<DiscordJWKServiceInterface>(TYPES.DiscordJWKService)
  .to(DiscordJWKService)
  .inSingletonScope();
container
  .bind<DiscordTokenServiceInterface>(TYPES.DiscordTokenService)
  .to(DiscordTokenService)
  .inSingletonScope();
container
  .bind<DiscordUserServiceInterface>(TYPES.DiscordUserService)
  .to(DiscordUserService)
  .inSingletonScope();

// Usecases
container
  .bind<DiscordAuthCallbackUseCaseInterface>(TYPES.DiscordAuthCallbackUseCase)
  .to(DiscordAuthCallbackUseCase)
  .inRequestScope();
container
  .bind<DiscordAuthInitiateUseCaseInterface>(TYPES.DiscordAuthInitiateUseCase)
  .to(DiscordAuthInitiateUseCase)
  .inRequestScope();

// Controllers
container
  .bind<AuthControllerInterface>(TYPES.AuthController)
  .to(AuthController)
  .inRequestScope();

export { container };
