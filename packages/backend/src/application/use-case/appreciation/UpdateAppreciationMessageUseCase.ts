import { err, ok, type Result } from "neverthrow";
import type {
  AppreciationID,
  AppreciationMessage
} from "../../../domain/appreciation/Appreciation";
import type { DiscordUserID } from "../../../domain/user/User";
import type { AppreciationRepositoryInterface } from "../../../infrastructure/repositories/AppreciationRepository";
import { UseCaseError } from "../../../utils/Error";

export interface UpdateAppreciationMessageUseCaseInterface {
  execute(
    appreciationID: AppreciationID,
    senderID: DiscordUserID,
    newMessage: AppreciationMessage
  ): Promise<Result<void, UpdateAppreciationMessageUseCaseError>>;
}

export class UpdateAppreciationMessageUseCase
  implements UpdateAppreciationMessageUseCaseInterface
{
  constructor(
    private readonly appreciationRepository: AppreciationRepositoryInterface
  ) {}

  async execute(
    appreciationID: AppreciationID,
    senderID: DiscordUserID,
    newMessage: AppreciationMessage
  ): Promise<Result<void, UpdateAppreciationMessageUseCaseError>> {
    // 既存の感謝を取得
    const appreciation =
      await this.appreciationRepository.findBy(appreciationID);
    if (!appreciation) {
      return err(new AppreciationNotFoundError(appreciationID));
    }

    // 送信者が一致するかチェック
    if (appreciation.senderID.value !== senderID.value) {
      return err(new UnauthorizedUpdateError(senderID, appreciationID));
    }

    // メッセージを更新
    const updatedAppreciation = appreciation.updateMessage(newMessage);

    // 更新を保存
    await this.appreciationRepository.store(updatedAppreciation);

    return ok();
  }
}

export class UpdateAppreciationMessageUseCaseError extends UseCaseError {}

export class AppreciationNotFoundError extends UpdateAppreciationMessageUseCaseError {
  constructor(appreciationID: AppreciationID) {
    super(
      `Appreciation not found: AppreciationID(value: ${appreciationID.value.value})`
    );
  }
}

export class UnauthorizedUpdateError extends UpdateAppreciationMessageUseCaseError {
  constructor(senderID: DiscordUserID, appreciationID: AppreciationID) {
    super(
      `User ${senderID.value} is not authorized to update appreciation ${appreciationID.value.value}`
    );
  }
}
