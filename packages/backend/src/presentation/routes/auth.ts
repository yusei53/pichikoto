import { Hono } from "hono";
import type { Variables } from "../..";

export const auth = new Hono<{ Variables: Variables }>();

auth.get("/", async (c) => {
  const controller = c.get("authController");
  return controller.getAuthUrl(c);
});

auth.get("/redirect", async (c) => {
  const code = c.req.query("code");
  const controller = c.get("authController");
  return controller.redirect(c, code);
});
