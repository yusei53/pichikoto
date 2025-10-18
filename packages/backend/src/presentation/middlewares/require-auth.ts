import type { Context, Next } from "hono";
import { JwtVerifyService } from "../../application/services/jwt/JWTVerifyService";

export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.slice("Bearer ".length);
  const verifyResult = await new JwtVerifyService().execute(c, token);
  if (verifyResult.isErr()) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const sub = verifyResult.value.jwtPayload.sub;
  if (!sub || typeof sub !== "string") {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("discordUserID", sub);
  return next();
}
