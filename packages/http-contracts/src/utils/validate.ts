import z from "zod";
import { BadRequestError } from "./http-error";

export const checkValidation = <T, U>(
  parsed: z.SafeParseReturnType<T, U>
): U => {
  if (!parsed.success) {
    // fieldErrorsは { [key: string]: string[] } 型なので、全てのエラーメッセージを配列化して結合する
    const messages = Object.values(parsed.error.flatten().fieldErrors)
      .flat()
      .filter(Boolean)
      .join(", ");
    throw new BadRequestError(messages, "ValidationError");
  }
  return parsed.data;
};
