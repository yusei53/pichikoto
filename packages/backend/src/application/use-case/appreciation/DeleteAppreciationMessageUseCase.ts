import { err, ok, type Result } from "neverthrow";
import type { AppreciationID } from "../../../domain/appreciation/Appreciation";
import type { DiscordUserID } from "../../../domain/user/User";
import type { AppreciationRepositoryInterface } from "../../../infrastructure/repositories/AppreciationRepository";
import { UseCaseError } from "../../../utils/Error";

export interface DeleteAppreciationMessageUseCaseInterface {
  execute(
    appreciationID: AppreciationID,
    senderID: DiscordUserID
  ): Promise<Result<void, DeleteAppreciationMessageUseCaseError>>;
}

export class DeleteAppreciationMessageUseCase
  implements DeleteAppreciationMessageUseCaseInterface
{
  constructor(
    private readonly appreciationRepository: AppreciationRepositoryInterface
  ) {}

  async execute(
    appreciationID: AppreciationID,
    senderID: DiscordUserID
  ): Promise<Result<void, DeleteAppreciationMessageUseCaseError>> {
    // 既存の感謝を取得
    const appreciation =
      await this.appreciationRepository.findBy(appreciationID);
    if (!appreciation) {
      return err(new AppreciationNotFoundError(appreciationID));
    }

    // 送信者が一致するかチェック
    if (appreciation.senderID.value !== senderID.value) {
      return err(new UnauthorizedDeleteError(senderID, appreciationID));
    }

    // 感謝を削除
    await this.appreciationRepository.delete(appreciationID);

    return ok();
  }
}

export class DeleteAppreciationMessageUseCaseError extends UseCaseError {}

export class AppreciationNotFoundError extends DeleteAppreciationMessageUseCaseError {
  constructor(appreciationID: AppreciationID) {
    super(
      `Appreciation not found: AppreciationID(value: ${appreciationID.value.value})`
    );
  }
}

export class UnauthorizedDeleteError extends DeleteAppreciationMessageUseCaseError {
  constructor(senderID: DiscordUserID, appreciationID: AppreciationID) {
    super(
      `User ${senderID.value} is not authorized to delete appreciation ${appreciationID.value.value}`
    );
  }
}
