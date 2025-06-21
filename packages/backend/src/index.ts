import { Hono } from "hono";
import { newContainer } from "./infrastructure/config/container";

const app = new Hono<{
  Variables: {
    container: ReturnType<typeof newContainer>;
  };
}>();

// USAGE:
// const container = c.get("container");
// const users = await container.dbClient.select().from(user);
app.use("*", async (c, next) => {
  c.set("container", newContainer(c));
  await next();
});

app.get("/", async (c) => {
  return c.text("Hello yuse retry!");
});

export default app;
