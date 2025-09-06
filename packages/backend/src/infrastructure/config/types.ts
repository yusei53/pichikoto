export const TYPES = {
  // Infrastructure
  DbClient: Symbol.for("DbClient"),

  // Repositories
  DiscordTokensRepository: Symbol.for("DiscordTokensRepository"),
  UserRepository: Symbol.for("UserRepository"),
  StateRepository: Symbol.for("StateRepository"),

  // Services
  DiscordOIDCService: Symbol.for("DiscordOIDCService"),
  JwtService: Symbol.for("JwtService"),

  // Usecases
  DiscordAuthCallbackUseCase: Symbol.for("DiscordAuthCallbackUseCase"),

  // Controllers
  AuthController: Symbol.for("AuthController")
};
