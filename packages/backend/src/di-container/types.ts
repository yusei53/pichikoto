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
  JwtService: Symbol.for("JwtService"),
  JwtVerifyService: Symbol.for("JwtVerifyService"),

  // Usecases
  DiscordAuthCallbackUseCase: Symbol.for("DiscordAuthCallbackUseCase"),
  DiscordAuthInitiateUseCase: Symbol.for("DiscordAuthInitiateUseCase"),
  DiscordAuthVerifyUsecase: Symbol.for("DiscordAuthVerifyUsecase"),

  // Controllers
  AuthController: Symbol.for("AuthController")
};
