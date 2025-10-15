import type { HttpError } from "@pichikoto/http-contracts";
import { InternalServerError } from "@pichikoto/http-contracts";
import type { Context } from "hono";
import type {
  AppreciationTotalPointQueryService,
  AppreciationTotalPointQueryServiceError
} from "../../query-service/AppreciationTotalPointQueryService";
import type {
  AppreciationUsersQueryService,
  AppreciationUsersQueryServiceError
} from "../../query-service/AppreciationUsersQueryService";
import { HttpErrorResponseCreator } from "../../utils/ResponseCreator";

export class PointsController {
  constructor(
    private readonly appreciationTotalPointQueryService: AppreciationTotalPointQueryService,
    private readonly appreciationUsersQueryService: AppreciationUsersQueryService
  ) {}

  /**
   * 指定されたDiscord User IDのユーザーの送信・受信総ポイントを取得するエンドポイント
   */
  async getAppreciationTotalPoint(c: Context): Promise<Response> {
    const responseCreator =
      new AppreciationTotalPointQueryServiceErrorResponseCreator();

    const discordUserId = c.req.param("discordUserId");
    const result =
      await this.appreciationTotalPointQueryService.get(discordUserId);

    return responseCreator.fromResult(result).respond(c);
  }

  /**
   * 指定されたDiscord User IDのユーザーの送信先・受信元ユーザー一覧を取得するエンドポイント
   */
  async getAppreciationUsers(c: Context): Promise<Response> {
    const responseCreator =
      new AppreciationUsersQueryServiceErrorResponseCreator();

    const discordUserId = c.req.param("discordUserId");
    const result = await this.appreciationUsersQueryService.get(discordUserId);

    return responseCreator.fromResult(result).respond(c);
  }
}

export class AppreciationTotalPointQueryServiceErrorResponseCreator extends HttpErrorResponseCreator<AppreciationTotalPointQueryServiceError> {
  protected createHttpError(
    error: AppreciationTotalPointQueryServiceError
  ): HttpError {
    return new InternalServerError(
      error.message,
      "AppreciationTotalPointQueryServiceError"
    );
  }
}

export class AppreciationUsersQueryServiceErrorResponseCreator extends HttpErrorResponseCreator<AppreciationUsersQueryServiceError> {
  protected createHttpError(
    error: AppreciationUsersQueryServiceError
  ): HttpError {
    return new InternalServerError(
      error.message,
      "AppreciationUsersQueryServiceError"
    );
  }
}
