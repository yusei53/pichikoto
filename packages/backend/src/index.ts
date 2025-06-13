import { Hono } from "hono";
import { userController } from "./di/container";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello yuse retry!");
});

app.post("/users", userController.postUser);

export default app;
