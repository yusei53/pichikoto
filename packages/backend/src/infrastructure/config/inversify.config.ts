import { Container } from "inversify";
import "reflect-metadata";
import type { IAuthUsecase } from "../../application/usecases/auth";
import { AuthUsecase } from "../../application/usecases/auth";
import type { IDiscordAuthService } from "../../domain/services/discord-auth";
import { DiscordAuthService } from "../../domain/services/discord-auth";
import type { IAuthController } from "../../presentation/controllers/auth";
import { AuthController } from "../../presentation/controllers/auth";
import { TYPES } from "./types";

const container = new Container();

// Domain
// Repository

// Service
container
  .bind<IDiscordAuthService>(TYPES.DiscordAuthService)
  .to(DiscordAuthService)
  .inSingletonScope();

// Application
// Usecase
container
  .bind<IAuthUsecase>(TYPES.AuthUsecase)
  .to(AuthUsecase)
  .inSingletonScope();

// Controller
container
  .bind<IAuthController>(TYPES.AuthController)
  .to(AuthController)
  .inSingletonScope();

export { container };
