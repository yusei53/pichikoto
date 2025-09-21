import { Hono } from "hono";
import type { Variables } from "../..";
import { withHttpErrorHandling } from "../../utils/HttpErrorHandler";

export const auth = new Hono<{ Variables: Variables }>();

auth.get("/", async (c) => {
  const controller = c.get("authController");
  return withHttpErrorHandling(c, controller.redirectToAuthURL);
});

auth.post("/callback", async (c) => {
  const controller = c.get("authController");
  return withHttpErrorHandling(c, controller.callback);
});

auth.post("/refresh", async (c) => {
  const controller = c.get("authController");
  return withHttpErrorHandling(c, controller.refresh);
});

auth.get("/is-authorized", async (c) => {
  const controller = c.get("authController");
  return withHttpErrorHandling(c, controller.verify);
});
