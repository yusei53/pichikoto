import type { Context } from "hono";
import { ok, type Result } from "neverthrow";
import type {
  AppreciationMessage,
  PointPerReceiver,
  ReceiverIDs
} from "../../../domain/appreciation/Appreciation";
import { Appreciation } from "../../../domain/appreciation/Appreciation";
import type { WeeklyPointLimitDomainServiceInterface } from "../../../domain/appreciation/WeeklyPointLimitDomainService";
import type { DiscordUserID } from "../../../domain/user/User";
import type { AppreciationRepositoryInterface } from "../../../infrastructure/repositories/AppreciationRepository";
import { UseCaseError } from "../../../utils/Error";
import { handleResult } from "../../../utils/ResultHelper";
import type { DiscordNotificationServiceInterface } from "../../services/discord-notification/DiscordNotificationService";

export interface CreateAppreciationUseCaseInterface {
  execute(
    c: Context,
    senderID: DiscordUserID,
    receiverIDs: ReceiverIDs,
    message: AppreciationMessage,
    pointPerReceiver: PointPerReceiver
  ): Promise<Result<void, CreateAppreciationUseCaseError>>;
}

export class CreateAppreciationUseCase
  implements CreateAppreciationUseCaseInterface
{
  constructor(
    private readonly appreciationRepository: AppreciationRepositoryInterface,
    private readonly weeklyPointLimitDomainService: WeeklyPointLimitDomainServiceInterface,
    private readonly discordNotificationService: DiscordNotificationServiceInterface
  ) {}

  async execute(
    c: Context,
    senderID: DiscordUserID,
    receiverIDs: ReceiverIDs,
    message: AppreciationMessage,
    pointPerReceiver: PointPerReceiver
  ): Promise<Result<void, CreateAppreciationUseCaseError>> {
    const appreciation = handleResult(
      Appreciation.create(senderID, receiverIDs, message, pointPerReceiver),
      (error) => new AppreciationDomainError(error)
    );

    const newConsumption = appreciation.getTotalConsumedPoints();

    // ドメインサービスを使用して週次ポイント制限を検証
    handleResult(
      await this.weeklyPointLimitDomainService.validateWeeklyLimit(
        senderID,
        newConsumption
      ),
      (error) => new AppreciationDomainServiceError(error)
    );

    await this.appreciationRepository.store(appreciation);

    // Discord通知を送信（失敗してもAppreciation作成は成功とする）
    try {
      const notificationResult =
        await this.discordNotificationService.sendAppreciationNotification(
          c,
          appreciation
        );

      if (notificationResult.isErr()) {
        console.warn("Discord notification failed:", notificationResult.error);
      }
    } catch (error) {
      // 通知送信失敗はログに記録するが、UseCase自体は成功とする
      console.warn("Discord notification failed:", error);
    }

    return ok();
  }
}

export class CreateAppreciationUseCaseError extends UseCaseError {}

export class AppreciationDomainError extends CreateAppreciationUseCaseError {
  constructor(cause: Error) {
    super(cause);
  }
}

export class AppreciationDomainServiceError extends CreateAppreciationUseCaseError {
  constructor(cause: Error) {
    super(cause);
  }
}
