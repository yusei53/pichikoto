import { Container } from "inversify";
import type { DiscordOIDCServiceInterface } from "../../application/services/discord-oidc";
import { DiscordOIDCService } from "../../application/services/discord-oidc";
import type { JwtServiceInterface } from "../../application/services/jwt";
import { JwtService } from "../../application/services/jwt";
import type { AuthUsecaseInterface } from "../../application/usecases/auth";
import { AuthUsecase } from "../../application/usecases/auth";
import type { AuthControllerInterface } from "../../presentation/controllers/auth";
import { AuthController } from "../../presentation/controllers/auth";
import type { DbClientInterface } from "../database/connection";
import { DbClient } from "../database/connection";
import type { UserAuthRepositoryInterface } from "../repositories/UserAuthRepository";
import { UserAuthRepository } from "../repositories/UserAuthRepository";
import type { UserRepositoryInterface } from "../repositories/UserRepository";
import { UserRepository } from "../repositories/UserRepository";
import type { StateRepositoryInterface } from "../repositories/StateRepository";
import { StateRepository } from "../repositories/StateRepository";
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
  .bind<UserAuthRepositoryInterface>(TYPES.UserAuthRepository)
  .to(UserAuthRepository)
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

// Usecases
container
  .bind<AuthUsecaseInterface>(TYPES.AuthUsecase)
  .to(AuthUsecase)
  .inRequestScope();

// Controllers
container
  .bind<AuthControllerInterface>(TYPES.AuthController)
  .to(AuthController)
  .inRequestScope();

export { container };
