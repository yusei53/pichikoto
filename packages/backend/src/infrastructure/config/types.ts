export const TYPES = {
  // Infrastructure
  DbClient: Symbol.for("DbClient"),

  // Repositories
  DiscordTokenRepository: Symbol.for("DiscordTokenRepository"),
  UserRepository: Symbol.for("UserRepository"),

  // Services
  DiscordOIDCService: Symbol.for("DiscordOIDCService"),
  JwtService: Symbol.for("JwtService"),

  // Usecases
  AuthUsecase: Symbol.for("AuthUsecase"),

  // Controllers
  AuthController: Symbol.for("AuthController")
};
