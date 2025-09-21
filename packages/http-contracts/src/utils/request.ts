import z from "zod";
import { checkValidation } from "./validate";

export const requestSchema = z.object({
  method: z.string(),
  url: z.string(),
  body: z.any().optional(),
  headers: z.any().optional()
});

export type RequestType = z.infer<typeof requestSchema>;

export const toRequest = (req: Request): RequestType => {
  const method = req.method;
  const url = req.url;
  const body = req.body;
  const headers = req.headers;
  const parsed = requestSchema.safeParse({ method, url, body, headers });
  const data = checkValidation(parsed);
  return data;
};

export const requestSchemaWithAuth = requestSchema.extend({
  headers: z.object({
    authorization: z.string().regex(/^Bearer\s+.+$/, {
      message: "Authorization header must start with 'Bearer '"
    })
  })
});

export type RequestTypeWithAuth = z.infer<typeof requestSchemaWithAuth>;

export const toRequestWithAuth = (req: Request): RequestTypeWithAuth => {
  const parsed = requestSchemaWithAuth.safeParse(toRequest(req));
  const data = checkValidation(parsed);
  return data;
};
