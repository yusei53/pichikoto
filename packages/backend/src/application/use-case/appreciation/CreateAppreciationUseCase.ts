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

export interface CreateAppreciationUseCaseInterface {
  execute(
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
    private readonly weeklyPointLimitDomainService: WeeklyPointLimitDomainServiceInterface
  ) {}

  async execute(
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
