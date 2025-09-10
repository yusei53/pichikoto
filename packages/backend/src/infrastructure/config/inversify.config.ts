import { Container } from "inversify";
import type { DbClientInterface } from "../../../database/connection";
import { DbClient } from "../../../database/connection";
import type { DiscordOAuthFlowServiceInterface } from "../../application/services/discord-auth/DiscordOAuthFlowService";
import { DiscordOAuthFlowService } from "../../application/services/discord-auth/DiscordOAuthFlowService";
import type { DiscordOIDCServiceInterface } from "../../application/services/discord-oidc";
import { DiscordOIDCService } from "../../application/services/discord-oidc";
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
  .bind<DiscordOIDCServiceInterface>(TYPES.DiscordOIDCService)
  .to(DiscordOIDCService)
  .inSingletonScope();
container
  .bind<DiscordOAuthFlowServiceInterface>(TYPES.DiscordOAuthFlowService)
  .to(DiscordOAuthFlowService)
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

// Controllers
container
  .bind<AuthControllerInterface>(TYPES.AuthController)
  .to(AuthController)
  .inRequestScope();

export { container };
