export type VerifyTokenResponse = {
  message: string;
};

export type CallbackResponse = {
  accessToken: string;
  refreshToken: string;
};

export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
};
