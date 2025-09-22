import { z } from "zod";
import {
  createRequestParser,
  requestSchema,
  requestSchemaWithAuth,
  toRequest,
  toRequestWithAuth
} from "../utils/request";

export const callbackRequestSchema = requestSchema.extend({
  body: z.object({
    code: z.string(),
    state: z.string()
  })
});

export type CallbackRequest = z.infer<typeof callbackRequestSchema>;

export const toCallbackRequest = async (
  req: Request
): Promise<CallbackRequest> =>
  createRequestParser(callbackRequestSchema, toRequest)(req);

export const refreshTokenRequestSchema = requestSchema.extend({
  body: z.object({
    refreshToken: z.string()
  })
});

export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;

export const toRefreshTokenRequest = async (
  req: Request
): Promise<RefreshTokenRequest> =>
  createRequestParser(refreshTokenRequestSchema, toRequest)(req);

export const verifyTokenRequestSchema = requestSchemaWithAuth;

export type VerifyTokenRequest = z.infer<typeof verifyTokenRequestSchema>;

export const toVerifyTokenRequest = async (
  req: Request
): Promise<VerifyTokenRequest> =>
  createRequestParser(verifyTokenRequestSchema, toRequestWithAuth)(req);
