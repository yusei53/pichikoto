import { Context } from "hono";
import { UserUsecase } from "../usecase/userUsecase";
import { createUserRequestSchema } from "../usecase/request/userRequest";

export class UserController {
  constructor(private userUsecase: UserUsecase) {}

  postUser = async (c: Context) => {
    const body = await c.req.json();
    const parseResult = createUserRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return c.json({ error: "Invalid request", details: parseResult.error.errors }, 400);
    }
    const result = await this.userUsecase.createUser(parseResult.data);
    return c.json(result, 201);
  };
} 