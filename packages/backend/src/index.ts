import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello yuse 2回目!");
});

export default app;
