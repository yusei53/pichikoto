import { toCreateAppreciationRequest } from "@pichikoto/http-contracts/appreciation";
import type { Context } from "hono";
import type { CreateAppreciationUseCaseInterface } from "../../application/use-case/appreciation/CreateAppreciationUseCase";
import {
  AppreciationMessage,
  PointPerReceiver,
  ReceiverIDs
} from "../../domain/appreciation/Appreciation";
import { UserID } from "../../domain/user/User";

export interface AppreciationControllerInterface {
  createAppreciation(c: Context): Promise<Response>;
}

export class AppreciationController implements AppreciationControllerInterface {
  constructor(
    private readonly createAppreciationUseCase: CreateAppreciationUseCaseInterface
  ) {}

  async createAppreciation(c: Context): Promise<Response> {
    try {
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

      if (result.isErr()) {
        console.error("CreateAppreciationUseCase error:", result.error);
        return c.json({ error: "Failed to create appreciation" }, 500);
      }

      return c.json({ message: "Appreciation created successfully" }, 201);
    } catch (error) {
      console.error("AppreciationController error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
}
