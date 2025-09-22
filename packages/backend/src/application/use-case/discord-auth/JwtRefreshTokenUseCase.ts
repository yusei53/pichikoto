import type { RefreshTokenResponse } from "@pichikoto/http-contracts";
import type { Context } from "hono";
import { sign } from "hono/jwt";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../di-container/types";
import type { JwtVerifyServiceInterface } from "../../services/jwt/JWTVerifyService";

export interface JwtRefreshTokenUseCaseInterface {
  execute(c: Context, refreshToken: string): Promise<RefreshTokenResponse>;
}

/**
 * JWTリフレッシュトークンを使用して新しいアクセストークンとリフレッシュトークンを生成するユースケース
 *
 * このクラスは以下の処理を行います：
 * 1. リフレッシュトークンの検証
 * 2. 新しいアクセストークンの生成（30日間有効）
 * 3. 新しいリフレッシュトークンの生成（1年間有効）
 */
@injectable()
export class JwtRefreshTokenUseCase implements JwtRefreshTokenUseCaseInterface {
  constructor(
    @inject(TYPES.JwtVerifyService)
    private readonly jwtVerifyService: JwtVerifyServiceInterface
  ) {}

  async execute(
    c: Context,
    refreshToken: string
  ): Promise<RefreshTokenResponse> {
    const payload = await this.jwtVerifyService.execute(c, refreshToken);
    if (payload.isErr()) {
      throw new JwtRefreshTokenUseCaseError(payload.error);
    }
    const userID = payload.value.jwtPayload.sub;

    const newAccessToken = await sign(
      {
        sub: userID,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 // 30日後
      },
      c.env.JWT_SECRET
    );

    const newRefreshToken = await sign(
      {
        sub: userID,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 // 1年後
      },
      c.env.JWT_SECRET
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }
}

class JwtRefreshTokenUseCaseError extends Error {
  readonly name = this.constructor.name;
  constructor(cause: Error) {
    super(
      `JwtRefreshTokenUseCaseError(cause: ${cause.name}: ${cause.message})`
    );
  }
}
