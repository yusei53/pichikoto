export const TYPES = {
  // Infrastructure
  DbClient: Symbol.for("DbClient"),

  // Repositories
  DiscordTokenRepository: Symbol.for("DiscordTokenRepository"),
  UserRepository: Symbol.for("UserRepository"),

  // Services
  DiscordAuthService: Symbol.for("DiscordAuthService"),
  JwtService: Symbol.for("JwtService"),

  // Usecases
  AuthUsecase: Symbol.for("AuthUsecase"),

  // Controllers
  AuthController: Symbol.for("AuthController")
};
