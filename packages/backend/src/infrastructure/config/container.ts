import type { Context } from "hono";
import { connectToDatabase } from "../database/connection";

export type Container = {
  dbClient: ReturnType<typeof connectToDatabase>;
};

export const newContainer = (c: Context) => {
  return {
    dbClient: connectToDatabase(c)
  };
};
