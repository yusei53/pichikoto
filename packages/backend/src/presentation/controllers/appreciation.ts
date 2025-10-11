import type { HttpError } from "@pichikoto/http-contracts";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError
} from "@pichikoto/http-contracts";
import { toCreateAppreciationRequest } from "@pichikoto/http-contracts/appreciation";
import type { Context } from "hono";
import type { AppreciationsQueryService } from "../../query-service/AppreciationsQueryService";
import type {
  CreateAppreciationUseCaseError,
  CreateAppreciationUseCaseInterface
} from "../../application/use-case/appreciation/CreateAppreciationUseCase";
import {
  AppreciationDomainError,
  AppreciationDomainServiceError
} from "../../application/use-case/appreciation/CreateAppreciationUseCase";
import type {
  UpdateAppreciationMessageUseCaseError,
  UpdateAppreciationMessageUseCaseInterface
} from "../../application/use-case/appreciation/UpdateAppreciationMessageUseCase";
import {
  AppreciationNotFoundError,
  UnauthorizedUpdateError
} from "../../application/use-case/appreciation/UpdateAppreciationMessageUseCase";
import {
  AppreciationID,
  AppreciationMessage,
  PointPerReceiver,
  ReceiverIDs
} from "../../domain/appreciation/Appreciation";
import { UserID } from "../../domain/user/User";
import { HttpErrorResponseCreator } from "../../utils/ResponseCreator";

export interface AppreciationControllerInterface {
  createAppreciation(c: Context): Promise<Response>;
  updateAppreciationMessage(c: Context): Promise<Response>;
  getAllAppreciations(c: Context): Promise<Response>;
}

export class AppreciationController implements AppreciationControllerInterface {
  constructor(
    private readonly createAppreciationUseCase: CreateAppreciationUseCaseInterface,
    private readonly updateAppreciationMessageUseCase: UpdateAppreciationMessageUseCaseInterface,
    private readonly appreciationsQueryService: AppreciationsQueryService
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

  async updateAppreciationMessage(c: Context): Promise<Response> {
    const responseCreator = new UpdateAppreciationMessageErrorResponseCreator();

    // JWTから送信者IDを取得（認証ミドルウェアで設定されることを想定）
    const senderID = c.get("userID");
    if (!senderID) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // URLパラメータから感謝IDを取得
    const appreciationIDParam = c.req.param("id");
    if (!appreciationIDParam) {
      return c.json({ error: "Appreciation ID is required" }, 400);
    }

    // リクエストボディからメッセージを取得
    const body = await c.req.json();
    if (!body.message || typeof body.message !== "string") {
      return c.json({ error: "Message is required" }, 400);
    }

    const appreciationID = AppreciationID.from(appreciationIDParam);
    const newMessage = AppreciationMessage.from(body.message);

    const result = await this.updateAppreciationMessageUseCase.execute(
      appreciationID,
      UserID.from(senderID),
      newMessage
    );

    return responseCreator.fromResult(result).respond(c);
  }

  async getAllAppreciations(c: Context): Promise<Response> {
    try {
      const result = await this.appreciationsQueryService.getAll();
      return c.json(result);
    } catch (error) {
      console.error("Failed to get all appreciations:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
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

export class UpdateAppreciationMessageErrorResponseCreator extends HttpErrorResponseCreator<UpdateAppreciationMessageUseCaseError> {
  protected createHttpError(
    error: UpdateAppreciationMessageUseCaseError
  ): HttpError {
    if (error instanceof AppreciationNotFoundError) {
      return new NotFoundError(error.message, "AppreciationNotFoundError");
    }
    if (error instanceof UnauthorizedUpdateError) {
      return new UnauthorizedError(error.message, "UnauthorizedUpdateError");
    }
    return new InternalServerError(error.message, "InternalServerError");
  }
}
