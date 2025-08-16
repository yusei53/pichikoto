import { Container } from "inversify";
import type { DiscordAuthServiceInterface } from "../../application/services/discord-auth";
import { DiscordAuthService } from "../../application/services/discord-auth";
import type { JwtServiceInterface } from "../../application/services/jwt";
import { JwtService } from "../../application/services/jwt";
import type { AuthUsecaseInterface } from "../../application/usecases/auth";
import { AuthUsecase } from "../../application/usecases/auth";
import type { AuthControllerInterface } from "../../presentation/controllers/auth";
import { AuthController } from "../../presentation/controllers/auth";
import type { DbClientInterface } from "../database/connection";
import { DbClient } from "../database/connection";
import type { DiscordTokenRepositoryInterface } from "../repositories/DiscordTokenRepository";
import { DiscordTokenRepository } from "../repositories/DiscordTokenRepository";
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
  .bind<DiscordTokenRepositoryInterface>(TYPES.DiscordTokenRepository)
  .to(DiscordTokenRepository)
  .inRequestScope();

// Services
container
  .bind<JwtServiceInterface>(TYPES.JwtService)
  .to(JwtService)
  .inSingletonScope();
container
  .bind<DiscordAuthServiceInterface>(TYPES.DiscordAuthService)
  .to(DiscordAuthService)
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
