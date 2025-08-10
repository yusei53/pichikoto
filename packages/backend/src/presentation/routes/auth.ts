import { Hono } from "hono";
import type { Variables } from "../..";

export const auth = new Hono<{ Variables: Variables }>();

auth.get("/", async (c) => {
  const controller = c.get("authController");
  return controller.getAuthUrl(c);
});

auth.post("/callback", async (c) => {
  const { code } = await c.req.json();
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
