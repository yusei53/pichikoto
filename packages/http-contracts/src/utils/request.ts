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
  return checkValidation(parsed);
};

export const createRequestParser = <Schema extends z.ZodTypeAny>(
  schema: Schema,
  baseParser: (req: Request) => Promise<unknown>
) => {
  return async (req: Request): Promise<z.infer<Schema>> => {
    const base = await baseParser(req);
    const parsed = schema.safeParse(base);
    return checkValidation(parsed);
  };
};

export const requestSchemaWithAuth = requestSchema.extend({
  headers: z.object({
    authorization: z.string().regex(/^Bearer\s+.+$/, {
      message: "Authorization header must start with 'Bearer '"
    })
  })
});

export type RequestTypeWithAuth = z.infer<typeof requestSchemaWithAuth>;

export const toRequestWithAuth = createRequestParser(
  requestSchemaWithAuth,
  toRequest
);
