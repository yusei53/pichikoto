import { Hono } from "hono";
import type { Variables } from "../..";
import { withHttpErrorHandling } from "../../utils/HttpErrorHandler";

export const auth = new Hono<{ Variables: Variables }>();

auth.get("/", async (c) => {
  const controller = c.get("authController");
  return withHttpErrorHandling(c, (ctx) => controller.redirectToAuthURL(ctx));
});

auth.post("/callback", async (c) => {
  const controller = c.get("authController");
  return withHttpErrorHandling(c, (ctx) => controller.callback(ctx));
});

auth.post("/refresh", async (c) => {
  const controller = c.get("authController");
  return withHttpErrorHandling(c, (ctx) => controller.refresh(ctx));
});

auth.get("/is-authorized", async (c) => {
  const controller = c.get("authController");
  return withHttpErrorHandling(c, (ctx) => controller.verify(ctx));
});
