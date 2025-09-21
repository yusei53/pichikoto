import { z } from "zod";
import {
  requestSchema,
  requestSchemaWithAuth,
  toRequest,
  toRequestWithAuth
} from "../utils/request";
import { checkValidation } from "../utils/validate";

export const callbackRequestSchema = requestSchema.extend({
  body: z.object({
    code: z.string().min(1),
    state: z.string().min(1)
  })
});

export type CallbackRequest = z.infer<typeof callbackRequestSchema>;

export const toCallbackRequest = (req: Request): CallbackRequest => {
  const parsed = callbackRequestSchema.safeParse(toRequest(req));
  const data = checkValidation(parsed);
  return data;
};

export const refreshTokenRequestSchema = requestSchema.extend({
  body: z.object({
    refreshToken: z.string().min(1)
  })
});

export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;

export const toRefreshTokenRequest = (req: Request): RefreshTokenRequest => {
  const parsed = refreshTokenRequestSchema.safeParse(toRequest(req));
  const data = checkValidation(parsed);
  return data;
};

export const verifyTokenRequestSchema = requestSchemaWithAuth;

export type VerifyTokenRequest = z.infer<typeof verifyTokenRequestSchema>;

export const toVerifyTokenRequest = (req: Request): VerifyTokenRequest => {
  const parsed = verifyTokenRequestSchema.safeParse(toRequestWithAuth(req));
  const data = checkValidation(parsed);
  return data;
};
