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
  DiscordAuthVerifyUseCase: Symbol.for("DiscordAuthVerifyUseCase"),
  DiscordAuthVerifyUseCaseV2: Symbol.for("DiscordAuthVerifyUseCaseV2"),

  // Controllers
  AuthController: Symbol.for("AuthController"),
  AuthV2Controller: Symbol.for("AuthV2Controller")
};
