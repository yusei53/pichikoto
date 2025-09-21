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

export const toCallbackRequest = async (
  req: Request
): Promise<CallbackRequest> => {
  const baseRequest = await toRequest(req);
  const parsed = callbackRequestSchema.safeParse(baseRequest);
  const data = checkValidation(parsed);
  return data;
};

export const refreshTokenRequestSchema = requestSchema.extend({
  body: z.object({
    refreshToken: z.string().min(1)
  })
});

export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;

export const toRefreshTokenRequest = async (
  req: Request
): Promise<RefreshTokenRequest> => {
  const baseRequest = await toRequest(req);
  const parsed = refreshTokenRequestSchema.safeParse(baseRequest);
  const data = checkValidation(parsed);
  return data;
};

export const verifyTokenRequestSchema = requestSchemaWithAuth;

export type VerifyTokenRequest = z.infer<typeof verifyTokenRequestSchema>;

export const toVerifyTokenRequest = async (
  req: Request
): Promise<VerifyTokenRequest> => {
  const baseRequest = await toRequestWithAuth(req);
  const parsed = verifyTokenRequestSchema.safeParse(baseRequest);
  const data = checkValidation(parsed);
  return data;
};
