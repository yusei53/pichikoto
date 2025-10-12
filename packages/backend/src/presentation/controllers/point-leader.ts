import type { HttpError } from "@pichikoto/http-contracts";
import { InternalServerError } from "@pichikoto/http-contracts";
import type { Context } from "hono";
import type {
  PointLeaderQueryService,
  PointLeaderQueryServiceError
} from "../../query-service/PointLeaderQueryService";
import { HttpErrorResponseCreator } from "../../utils/ResponseCreator";

export class PointLeaderController {
  constructor(
    private readonly pointLeaderQueryService: PointLeaderQueryService
  ) {}

  /**
   * 今週のポイント送信・受信上位3人ずつを取得するエンドポイント
   */
  async getWeeklyLeaders(c: Context) {
    const responseCreator = new PointLeaderQueryServiceErrorResponseCreator();
    const leaders = await this.pointLeaderQueryService.getWeeklyLeaders();

    return responseCreator.fromResult(leaders).respond(c);
  }
}

export class PointLeaderQueryServiceErrorResponseCreator extends HttpErrorResponseCreator<PointLeaderQueryServiceError> {
  protected createHttpError(error: PointLeaderQueryServiceError): HttpError {
    return new InternalServerError(
      error.message,
      "PointLeaderQueryServiceError"
    );
  }
}
