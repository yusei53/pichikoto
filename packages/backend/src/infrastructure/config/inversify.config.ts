import { Container } from "inversify";
import "reflect-metadata";
import type { IAuthUsecase } from "../../application/usecases/auth";
import { AuthUsecase } from "../../application/usecases/auth";
import type { IUserRepository } from "../../domain/repositories/user";
import { UserRepository } from "../../domain/repositories/user";
import type { IUserAuthRepository } from "../../domain/repositories/userAuth";
import { UserAuthRepository } from "../../domain/repositories/userAuth";
import type { IDiscordAuthService } from "../../domain/services/discord-auth";
import { DiscordAuthService } from "../../domain/services/discord-auth";
import { JwtService, type IJwtService } from "../../domain/services/jwt";
import type { IAuthController } from "../../presentation/controllers/auth";
import { AuthController } from "../../presentation/controllers/auth";
import { DbClient, type IDbClient } from "../database/connection";
import { TYPES } from "./types";

const container = new Container();

// Infrastructure
container.bind<IDbClient>(TYPES.DbClient).to(DbClient).inRequestScope();

// Repositories
container
  .bind<IUserRepository>(TYPES.UserRepository)
  .to(UserRepository)
  .inRequestScope();
container
  .bind<IUserAuthRepository>(TYPES.UserAuthRepository)
  .to(UserAuthRepository)
  .inRequestScope();

// Services
container.bind<IJwtService>(TYPES.JwtService).to(JwtService).inSingletonScope();
container
  .bind<IDiscordAuthService>(TYPES.DiscordAuthService)
  .to(DiscordAuthService)
  .inSingletonScope();

// Usecases
container
  .bind<IAuthUsecase>(TYPES.AuthUsecase)
  .to(AuthUsecase)
  .inRequestScope();

// Controllers
container
  .bind<IAuthController>(TYPES.AuthController)
  .to(AuthController)
  .inRequestScope();

export { container };
