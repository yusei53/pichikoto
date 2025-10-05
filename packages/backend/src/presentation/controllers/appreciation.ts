import type { HttpError } from "@pichikoto/http-contracts";
import {
  BadRequestError,
  InternalServerError
} from "@pichikoto/http-contracts";
import { toCreateAppreciationRequest } from "@pichikoto/http-contracts/appreciation";
import type { Context } from "hono";
import type {
  CreateAppreciationUseCaseError,
  CreateAppreciationUseCaseInterface
} from "../../application/use-case/appreciation/CreateAppreciationUseCase";
import {
  AppreciationDomainError,
  AppreciationDomainServiceError
} from "../../application/use-case/appreciation/CreateAppreciationUseCase";
import {
  AppreciationMessage,
  PointPerReceiver,
  ReceiverIDs
} from "../../domain/appreciation/Appreciation";
import { UserID } from "../../domain/user/User";
import { HttpErrorResponseCreator } from "../../utils/ResponseCreator";

export interface AppreciationControllerInterface {
  createAppreciation(c: Context): Promise<Response>;
}

export class AppreciationController implements AppreciationControllerInterface {
  constructor(
    private readonly createAppreciationUseCase: CreateAppreciationUseCaseInterface
  ) {}

  async createAppreciation(c: Context): Promise<Response> {
    const responseCreator = new CreateAppreciationErrorResponseCreator();

    const req = await toCreateAppreciationRequest(c.req.raw);

    // JWTから送信者IDを取得（認証ミドルウェアで設定されることを想定）
    const senderID = c.get("userID");
    if (!senderID) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const receiverIDs = ReceiverIDs.from(
      req.body.receiverIDs.map((id: string) => UserID.from(id))
    );
    const message = AppreciationMessage.from(req.body.message);
    const pointPerReceiver = PointPerReceiver.from(req.body.pointPerReceiver);

    const result = await this.createAppreciationUseCase.execute(
      UserID.from(senderID),
      receiverIDs,
      message,
      pointPerReceiver
    );

    return responseCreator.fromResult(result).respond(c);
  }
}

export class CreateAppreciationErrorResponseCreator extends HttpErrorResponseCreator<CreateAppreciationUseCaseError> {
  protected createHttpError(error: CreateAppreciationUseCaseError): HttpError {
    if (error instanceof AppreciationDomainError) {
      return new BadRequestError(error.message, "AppreciationDomainError");
    }
    if (error instanceof AppreciationDomainServiceError) {
      return new BadRequestError(
        error.message,
        "AppreciationDomainServiceError"
      );
    }
    return new InternalServerError(error.message, "InternalServerError");
  }
}
