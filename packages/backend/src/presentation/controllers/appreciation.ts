import type { HttpError } from "@pichikoto/http-contracts";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError
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
import { DiscordUserID } from "../../domain/user/User";
import type {
  AppreciationsQueryService,
  AppreciationsQueryServiceError
} from "../../query-service/AppreciationsQueryService";
import type {
  ReceivedAppreciationsQueryService,
  ReceivedAppreciationsQueryServiceError
} from "../../query-service/ReceivedAppreciationsQueryService";
import type {
  SentAppreciationsQueryService,
  SentAppreciationsQueryServiceError
} from "../../query-service/SentAppreciationsQueryService";
import { HttpErrorResponseCreator } from "../../utils/ResponseCreator";

export interface AppreciationControllerInterface {
  getAllAppreciations(c: Context): Promise<Response>;
  getSentAppreciations(c: Context): Promise<Response>;
  getReceivedAppreciations(c: Context): Promise<Response>;
  createAppreciation(c: Context): Promise<Response>;
  updateAppreciationMessage(c: Context): Promise<Response>;
}

export class AppreciationController implements AppreciationControllerInterface {
  constructor(
    private readonly createAppreciationUseCase: CreateAppreciationUseCaseInterface,
    private readonly updateAppreciationMessageUseCase: UpdateAppreciationMessageUseCaseInterface,
    private readonly appreciationsQueryService: AppreciationsQueryService,
    private readonly sentAppreciationsQueryService: SentAppreciationsQueryService,
    private readonly receivedAppreciationsQueryService: ReceivedAppreciationsQueryService
  ) {}

  async getAllAppreciations(c: Context): Promise<Response> {
    const responseCreator = new AppreciationsQueryServiceErrorResponseCreator();
    const result = await this.appreciationsQueryService.getAll();

    return responseCreator.fromResult(result).respond(c);
  }

  async getSentAppreciations(c: Context): Promise<Response> {
    const responseCreator =
      new SentAppreciationsQueryServiceErrorResponseCreator();

    const discordUserId = c.req.param("discordUserId");
    const result =
      await this.sentAppreciationsQueryService.getByDiscordUserId(
        discordUserId
      );

    return responseCreator.fromResult(result).respond(c);
  }

  async getReceivedAppreciations(c: Context): Promise<Response> {
    const responseCreator =
      new ReceivedAppreciationsQueryServiceErrorResponseCreator();

    const discordUserId = c.req.param("discordUserId");
    const result =
      await this.receivedAppreciationsQueryService.getByDiscordUserId(
        discordUserId
      );

    return responseCreator.fromResult(result).respond(c);
  }

  async createAppreciation(c: Context): Promise<Response> {
    const responseCreator = new CreateAppreciationErrorResponseCreator();

    const req = await toCreateAppreciationRequest(c.req.raw);

    // JWTから送信者IDを取得（認証ミドルウェアで設定されることを想定）
    const senderID = c.get("discordUserID");
    if (!senderID) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const receiverIDs = ReceiverIDs.from(
      req.body.receiverIDs.map((id: string) => DiscordUserID.from(id))
    );
    const message = AppreciationMessage.from(req.body.message);
    const pointPerReceiver = PointPerReceiver.from(req.body.pointPerReceiver);

    const result = await this.createAppreciationUseCase.execute(
      DiscordUserID.from(senderID),
      receiverIDs,
      message,
      pointPerReceiver
    );

    return responseCreator.fromResult(result).respond(c);
  }

  async updateAppreciationMessage(c: Context): Promise<Response> {
    const responseCreator = new UpdateAppreciationMessageErrorResponseCreator();

    const senderID = c.get("discordUserID");
    const appreciationIDParam = c.req.param("id");
    const body = await c.req.json();

    const appreciationID = AppreciationID.from(appreciationIDParam);
    const newMessage = AppreciationMessage.from(body.message);

    const result = await this.updateAppreciationMessageUseCase.execute(
      appreciationID,
      DiscordUserID.from(senderID),
      newMessage
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

export class AppreciationsQueryServiceErrorResponseCreator extends HttpErrorResponseCreator<AppreciationsQueryServiceError> {
  protected createHttpError(error: AppreciationsQueryServiceError): HttpError {
    return new InternalServerError(
      error.message,
      "AppreciationsQueryServiceError"
    );
  }
}

export class SentAppreciationsQueryServiceErrorResponseCreator extends HttpErrorResponseCreator<SentAppreciationsQueryServiceError> {
  protected createHttpError(
    error: SentAppreciationsQueryServiceError
  ): HttpError {
    return new InternalServerError(
      error.message,
      "SentAppreciationsQueryServiceError"
    );
  }
}

export class ReceivedAppreciationsQueryServiceErrorResponseCreator extends HttpErrorResponseCreator<ReceivedAppreciationsQueryServiceError> {
  protected createHttpError(
    error: ReceivedAppreciationsQueryServiceError
  ): HttpError {
    return new InternalServerError(
      error.message,
      "ReceivedAppreciationsQueryServiceError"
    );
  }
}
