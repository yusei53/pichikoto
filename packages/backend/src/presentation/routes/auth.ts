import { Hono } from "hono";
import type { Variables } from "../..";

export const auth = new Hono<{ Variables: Variables }>();

auth.get("/", async (c) => {
  const controller = c.get("authController");
  return controller.redirectToAuthURL(c);
});

auth.post("/callback", async (c) => {
  const controller = c.get("authController");
  return controller.callback(c);
});

auth.post("/refresh", async (c) => {
  const controller = c.get("authController");
  return controller.refresh(c);
});

auth.get("/is-authorized", async (c) => {
  const controller = c.get("authController");
  return controller.verify(c);
});
