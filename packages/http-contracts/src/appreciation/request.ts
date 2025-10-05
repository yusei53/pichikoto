import { z } from "zod";
import {
  createRequestParser,
  requestSchemaWithAuth,
  toRequestWithAuth,
} from "../utils/request";

export const createAppreciationRequestSchema = requestSchemaWithAuth.extend({
  body: z.object({
    receiverIDs: z
      .array(z.string())
      .min(1, "At least one receiver is required"),
    message: z.string().min(1, "Message is required"),
    pointPerReceiver: z.number().int().min(1).max(100),
  }),
});

export type CreateAppreciationRequest = z.infer<
  typeof createAppreciationRequestSchema
>;

export const toCreateAppreciationRequest = async (
  req: Request
): Promise<CreateAppreciationRequest> =>
  createRequestParser(createAppreciationRequestSchema, toRequestWithAuth)(req);

export const updateAppreciationMessageRequestSchema =
  requestSchemaWithAuth.extend({
    body: z.object({
      message: z.string().min(1, "Message is required"),
    }),
    param: z.object({
      id: z.string().min(1, "Appreciation ID is required"),
    }),
  });

export type UpdateAppreciationMessageRequest = z.infer<
  typeof updateAppreciationMessageRequestSchema
>;

export const toUpdateAppreciationMessageRequest = async (
  req: Request
): Promise<UpdateAppreciationMessageRequest> =>
  createRequestParser(
    updateAppreciationMessageRequestSchema,
    toRequestWithAuth
  )(req);
