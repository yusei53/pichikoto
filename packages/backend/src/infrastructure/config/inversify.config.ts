import { Container } from "inversify";
import type { AuthUsecaseInterface } from "../../application/usecases/auth";
import { AuthUsecase } from "../../application/usecases/auth";
import type { UserRepositoryInterface } from "../../domain/repositories/user";
import { UserRepository } from "../../domain/repositories/user";
import type { UserAuthRepositoryInterface } from "../../domain/repositories/userAuth";
import { UserAuthRepository } from "../../domain/repositories/userAuth";
import type { DiscordAuthServiceInterface } from "../../domain/services/discord-auth";
import { DiscordAuthService } from "../../domain/services/discord-auth";
import type { JwtServiceInterface } from "../../domain/services/jwt";
import { JwtService } from "../../domain/services/jwt";
import type { AuthControllerInterface } from "../../presentation/controllers/auth";
import { AuthController } from "../../presentation/controllers/auth";
import type { DbClientInterface } from "../database/connection";
import { DbClient } from "../database/connection";
import { TYPES } from "./types";

const container = new Container();

// Infrastructure
container.bind<DbClientInterface>(TYPES.DbClient).to(DbClient).inSingletonScope();

// Repositories
container
  .bind<UserRepositoryInterface>(TYPES.UserRepository)
  .to(UserRepository)
  .inRequestScope();
container
  .bind<UserAuthRepositoryInterface>(TYPES.UserAuthRepository)
  .to(UserAuthRepository)
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
