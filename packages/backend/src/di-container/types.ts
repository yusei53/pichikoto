export const TYPES = {
  // Infrastructure
  DbClient: Symbol.for("DbClient"),

  // Repositories
  DiscordTokensRepository: Symbol.for("DiscordTokensRepository"),
  UserRepository: Symbol.for("UserRepository"),
  StateRepository: Symbol.for("StateRepository"),

  // Services
  DiscordOAuthFlowService: Symbol.for("DiscordOAuthFlowService"),
  DiscordTokenService: Symbol.for("DiscordTokenService"),
  DiscordUserService: Symbol.for("DiscordUserService"),
  DiscordJWKService: Symbol.for("DiscordJWKService"),
  JwtGenerateService: Symbol.for("JwtGenerateService"),
  JwtVerifyService: Symbol.for("JwtVerifyService"),

  // Usecases
  DiscordAuthCallbackUseCase: Symbol.for("DiscordAuthCallbackUseCase"),
  DiscordAuthInitiateUseCase: Symbol.for("DiscordAuthInitiateUseCase"),
  DiscordAuthVerifyUseCase: Symbol.for("DiscordAuthVerifyUseCase"),
  JwtRefreshTokenUseCase: Symbol.for("JwtRefreshTokenUseCase"),

  // Controllers
  AuthController: Symbol.for("AuthController")
};
