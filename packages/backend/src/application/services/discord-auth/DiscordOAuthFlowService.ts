import { inject, injectable } from "inversify";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { TYPES } from "../../../infrastructure/config/types";
import type { StateRepositoryInterface } from "../../../infrastructure/repositories/StateRepository";

export type StateVerification = {
  nonce: string;
  codeVerifier: string;
};

/**
 * Discord OAuth フロー管理サービスのインターフェース
 */
export interface DiscordOAuthFlowServiceInterface {
  verifyStateBySessionID(
    sessionId: string,
    state: string
  ): Promise<Result<StateVerification, StateVerificationError>>;
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
   * @param sessionId - セッションID
   * @param state - stateパラメータ
   * @returns 検証結果（成功時はnonce/codeVerifier、失敗時はエラー）
   */
  async verifyStateBySessionID(
    sessionId: string,
    state: string
  ): Promise<Result<StateVerification, StateVerificationError>> {
    try {
      const stateRecord = await this.stateRepository.findBy(sessionId);
      if (!stateRecord) return err(new StateNotFoundError(sessionId));

      if (stateRecord.state !== state) {
        await this.stateRepository.delete(sessionId);
        return err(new StateMismatchError());
      }

      if (stateRecord.expiresAt < new Date()) {
        await this.stateRepository.delete(sessionId);
        return err(new StateExpiredError());
      }

      if (!stateRecord.nonce || !stateRecord.codeVerifier) {
        await this.stateRepository.delete(sessionId);
        return err(new MissingRequiredDataError());
      }

      await this.stateRepository.delete(sessionId);

      return ok({
        nonce: stateRecord.nonce,
        codeVerifier: stateRecord.codeVerifier
      });
    } catch (error) {
      // エラー時はレコードをクリーンアップしてエラーを返す
      await this.stateRepository.delete(sessionId);
      return err(new RepositoryError(error));
    }
  }
}

type StateVerificationError =
  | StateNotFoundError
  | StateMismatchError
  | StateExpiredError
  | MissingRequiredDataError
  | RepositoryError;

/**
 * Stateレコードが見つからない場合のエラー
 */
class StateNotFoundError extends Error {
  readonly name = this.constructor.name;
  constructor(sessionId: string) {
    super(`State record not found for sessionId: ${sessionId}`);
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

/**
 * 必須データ（nonce/codeVerifier）が不足している場合のエラー
 */
class MissingRequiredDataError extends Error {
  readonly name = this.constructor.name;
  constructor() {
    super("Required nonce or codeVerifier is missing from state record");
  }
}

/**
 * データベース操作でエラーが発生した場合のエラー
 */
class RepositoryError extends Error {
  readonly name = this.constructor.name;
  constructor(cause: unknown) {
    super(`Database operation failed during state verification: ${cause}`);
  }
}
