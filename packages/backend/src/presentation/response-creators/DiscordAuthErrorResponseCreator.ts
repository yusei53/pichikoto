import type { HttpError } from "@pichikoto/http-contracts";
import { UnauthorizedError } from "@pichikoto/http-contracts";
import type { DiscordAuthVerifyUseCaseError } from "../../application/use-case/discord-auth/DiscordAuthVerifyUseCase";
import { HttpErrorResponseCreator } from "../../utils/response";

/**
 * DiscordAuthVerifyError用のResponseCreator
 * 改善版：HttpErrorを活用して型安全性を向上
 */
export class DiscordAuthVerifyErrorResponseCreator extends HttpErrorResponseCreator<DiscordAuthVerifyUseCaseError> {
  protected createHttpError(error: DiscordAuthVerifyUseCaseError): HttpError {
    return new UnauthorizedError({
      detail: error.message,
      originalError: error.cause
    });
  }
}
