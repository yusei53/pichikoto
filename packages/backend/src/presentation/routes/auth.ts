import { Hono } from "hono";
import type { Variables } from "../..";

export const auth = new Hono<{ Variables: Variables }>();

auth.get("/", async (c) => {
  const controller = c.get("authController");
  return controller.RedirectToAuthUrl(c);
});

auth.get("/callback", async (c) => {
  const code = c.req.query("code");
  const controller = c.get("authController");
  return controller.callback(c, code);
});

auth.post("/refresh", async (c) => {
  const controller = c.get("authController");
  return controller.refresh(c);
});

auth.get("/verify", async (c) => {
  const controller = c.get("authController");
  return controller.verify(c);
});
