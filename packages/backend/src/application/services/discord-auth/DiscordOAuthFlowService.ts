import { inject, injectable } from "inversify";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { TYPES } from "../../../infrastructure/config/types";
import type { StateRepositoryInterface } from "../../../infrastructure/repositories/StateRepository";

type StateVerification = {
  nonce: string;
  codeVerifier: string;
};

/**
 * Discord OAuth フロー管理サービスのインターフェース
 */
export interface DiscordOAuthFlowServiceInterface {
  verifyStateBySessionID(
    sessionID: string,
    state: string
  ): Promise<Result<StateVerification, VerifyStateBySessionIDError>>;
}

/**
 * Discord OAuth フロー管理サービス
 *
 * OAuth認証フローにおけるstate検証とセキュリティ管理を担当する。
 * - CSRF攻撃防止のためのstate検証
 * - セッション管理とクリーンアップ
 * - OIDC/PKCE用パラメータの安全な取得
 */
@injectable()
export class DiscordOAuthFlowService
  implements DiscordOAuthFlowServiceInterface
{
  constructor(
    @inject(TYPES.StateRepository)
    private readonly stateRepository: StateRepositoryInterface
  ) {}

  /**
   * セッションIDとstateパラメータを検証する
   *
   * 以下の検証を行う：
   * 1. State recordの存在確認
   * 2. Stateパラメータの一致確認
   * 3. 有効期限の確認
   * 4. 必須データ（nonce/codeVerifier）の存在確認
   *
   * @param sessionID - セッションID
   * @param state - stateパラメータ
   * @returns 検証結果（成功時はnonce/codeVerifier、失敗時はエラー）
   */
  async verifyStateBySessionID(
    sessionID: string,
    state: string
  ): Promise<Result<StateVerification, VerifyStateBySessionIDError>> {
    try {
      const stateRecord = await this.stateRepository.findBy(sessionID);

      if (!stateRecord) return err(new StateNotFoundError(sessionID));
      if (stateRecord.state !== state) return err(new StateMismatchError());
      if (stateRecord.expiresAt < new Date())
        return err(new StateExpiredError());

      return ok({
        nonce: stateRecord.nonce,
        codeVerifier: stateRecord.codeVerifier
      });
    } finally {
      // 成功・失敗に関わらずstateレコードを削除
      await this.stateRepository.delete(sessionID);
    }
  }
}

type VerifyStateBySessionIDError =
  | StateNotFoundError
  | StateMismatchError
  | StateExpiredError;

/**
 * Stateレコードが見つからない場合のエラー
 */
class StateNotFoundError extends Error {
  readonly name = this.constructor.name;
  constructor(sessionID: string) {
    super(`State record not found for sessionID: ${sessionID}`);
  }
}

/**
 * Stateパラメータが一致しない場合のエラー（CSRF攻撃の可能性）
 */
class StateMismatchError extends Error {
  readonly name = this.constructor.name;
  constructor() {
    super("Provided state does not match stored state");
  }
}

/**
 * Stateレコードの有効期限が切れている場合のエラー
 */
class StateExpiredError extends Error {
  readonly name = this.constructor.name;
  constructor() {
    super("State has expired");
  }
}
