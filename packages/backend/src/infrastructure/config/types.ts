export const TYPES = {
  // Infrastructure
  DbClient: Symbol.for("DbClient"),

  // Repositories
  UserAuthRepository: Symbol.for("UserAuthRepository"),
  UserRepository: Symbol.for("UserRepository"),
  StateRepository: Symbol.for("StateRepository"),

  // Services
  DiscordOIDCService: Symbol.for("DiscordOIDCService"),
  JwtService: Symbol.for("JwtService"),

  // Usecases
  AuthUsecase: Symbol.for("AuthUsecase"),

  // Controllers
  AuthController: Symbol.for("AuthController")
};
