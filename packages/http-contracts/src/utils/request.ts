import z from "zod";
import { checkValidation } from "./validate";

const parseRequestBody = async (req: Request): Promise<unknown> => {
  if (req.method === "GET" || req.method === "HEAD") {
    return undefined;
  }

  try {
    return await req.clone().json();
  } catch {
    return undefined;
  }
};

const toHeadersRecord = (headers: Headers): Record<string, string> => {
  const record: Record<string, string> = {};
  headers.forEach((value, key) => {
    record[key.toLowerCase()] = value;
  });
  return record;
};

export const requestSchema = z.object({
  method: z.string(),
  url: z.string(),
  body: z.any().optional(),
  headers: z.record(z.string()).optional()
});

export type RequestType = z.infer<typeof requestSchema>;

export const toRequest = async (req: Request): Promise<RequestType> => {
  const method = req.method;
  const url = req.url;
  const body = await parseRequestBody(req);
  const headers = toHeadersRecord(req.headers);
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

export const toRequestWithAuth = async (
  req: Request
): Promise<RequestTypeWithAuth> => {
  const parsed = requestSchemaWithAuth.safeParse(await toRequest(req));
  const data = checkValidation(parsed);
  return data;
};
