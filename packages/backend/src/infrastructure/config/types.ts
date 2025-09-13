export const TYPES = {
  // Infrastructure
  DbClient: Symbol.for("DbClient"),

  // Repositories
  DiscordTokensRepository: Symbol.for("DiscordTokensRepository"),
  UserRepository: Symbol.for("UserRepository"),
  StateRepository: Symbol.for("StateRepository"),

  // Services
  DiscordOIDCService: Symbol.for("DiscordOIDCService"),
  DiscordOAuthFlowService: Symbol.for("DiscordOAuthFlowService"),
  DiscordTokenService: Symbol.for("DiscordTokenService"),
  DiscordUserService: Symbol.for("DiscordUserService"),
  DiscordJWKService: Symbol.for("DiscordJWKService"),
  JwtService: Symbol.for("JwtService"),

  // Usecases
  DiscordAuthCallbackUseCase: Symbol.for("DiscordAuthCallbackUseCase"),
  DiscordAuthInitiateUseCase: Symbol.for("DiscordAuthInitiateUseCase"),

  // Controllers
  AuthController: Symbol.for("AuthController")
};
