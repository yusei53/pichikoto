import { z } from "zod";

export const callbackResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string()
});

export type CallbackResponse = z.infer<typeof callbackResponseSchema>;

export const toCallbackResponse = (
  accessToken: string,
  refreshToken: string
): CallbackResponse => {
  return callbackResponseSchema.parse({
    accessToken,
    refreshToken
  });
};

export const refreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string()
});

export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;

export const toRefreshTokenResponse = (
  accessToken: string,
  refreshToken: string
): RefreshTokenResponse => {
  return refreshTokenResponseSchema.parse({
    accessToken,
    refreshToken
  });
};

export const verifyTokenResponseSchema = z.object({
  message: z.string()
});

export type VerifyTokenResponse = z.infer<typeof verifyTokenResponseSchema>;

export const toVerifyTokenResponse = (message: string): VerifyTokenResponse => {
  return verifyTokenResponseSchema.parse({ message });
};
