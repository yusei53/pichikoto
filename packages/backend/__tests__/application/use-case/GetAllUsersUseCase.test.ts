import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GetAllUsersUseCase } from "../../../src/application/use-case/user/GetAllUsersUseCase";
import { DiscordUserID, User } from "../../../src/domain/user/User";
import type { UserRepositoryInterface } from "../../../src/infrastructure/repositories/UserRepository";

describe("GetAllUsersUseCase Tests", () => {
  // モックリポジトリ
  const mockUserRepository: UserRepositoryInterface = {
    findBy: vi.fn(),
    getAll: vi.fn(),
    save: vi.fn()
  };

  const getAllUsersUseCase = new GetAllUsersUseCase(mockUserRepository);

  beforeEach(() => {
    // 各テストケースの前にモックをクリア
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 各テストケースの後にモックをクリア
    vi.clearAllMocks();
  });

  describe("execute", () => {
    /**
     * 正常ケース：全ユーザーの取得が正常に行われることのテストケース
     *
     * @description UserRepositoryのgetAllメソッドが呼び出され、取得したユーザー一覧が正常に返却されることを確認
     *
     * Arrange
     * - 複数のユーザーデータを準備
     * - UserRepositoryのgetAllメソッドをモック設定
     *
     * Act
     * - GetAllUsersUseCaseのexecuteメソッド実行
     *
     * Assert
     * - UserRepositoryのgetAllメソッドが1回呼び出されることを確認
     * - 期待されるユーザー一覧が返却されることを確認
     */
    it("正常ケース：全ユーザーの取得が正常に行われること", async () => {
      // Arrange
      const mockUsers = [
        User.reconstruct(
          DiscordUserID.from(DiscordUserID.new().value),
          "テストユーザー1",
          "ゆせ",
          "avatar1.png"
        ),
        User.reconstruct(
          DiscordUserID.from(DiscordUserID.new().value),
          "テストユーザー2",
          "ゆせ",
          "avatar2.png"
        ),
        User.reconstruct(
          DiscordUserID.from(DiscordUserID.new().value),
          "テストユーザー3",
          "ゆせ",
          "avatar3.png"
        )
      ];

      vi.mocked(mockUserRepository.getAll).mockResolvedValue(mockUsers);

      // Act
      const result = await getAllUsersUseCase.execute();

      // Assert
      expect(mockUserRepository.getAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(3);
      expect(result[0].discordUserName).toBe("テストユーザー1");
      expect(result[1].discordUserName).toBe("テストユーザー2");
      expect(result[2].discordUserName).toBe("テストユーザー3");
    });

    /**
     * 正常ケース：ユーザーが存在しない場合の空配列返却テストケース
     *
     * @description ユーザーが1人も存在しない場合、空配列が正常に返却されることを確認
     *
     * Arrange
     * - UserRepositoryのgetAllメソッドを空配列を返すようにモック設定
     *
     * Act
     * - GetAllUsersUseCaseのexecuteメソッド実行
     *
     * Assert
     * - UserRepositoryのgetAllメソッドが1回呼び出されることを確認
     * - 空配列が返却されることを確認
     */
    it("正常ケース：ユーザーが存在しない場合、空配列が返却されること", async () => {
      // Arrange
      vi.mocked(mockUserRepository.getAll).mockResolvedValue([]);

      // Act
      const result = await getAllUsersUseCase.execute();

      // Assert
      expect(mockUserRepository.getAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    /**
     * 正常ケース：単一ユーザーの取得テストケース
     *
     * @description ユーザーが1人だけ存在する場合、正常に1要素の配列が返却されることを確認
     *
     * Arrange
     * - 単一のユーザーデータを準備
     * - UserRepositoryのgetAllメソッドをモック設定
     *
     * Act
     * - GetAllUsersUseCaseのexecuteメソッド実行
     *
     * Assert
     * - UserRepositoryのgetAllメソッドが1回呼び出されることを確認
     * - 1要素の配列が返却されることを確認
     * - ユーザー情報が正確であることを確認
     */
    it("正常ケース：単一ユーザーが存在する場合、1要素の配列が返却されること", async () => {
      // Arrange
      const singleUser = User.reconstruct(
        DiscordUserID.from(DiscordUserID.new().value),
        "単独ユーザー",
        "ゆせ",
        "single_avatar.png"
      );

      vi.mocked(mockUserRepository.getAll).mockResolvedValue([singleUser]);

      // Act
      const result = await getAllUsersUseCase.execute();

      // Assert
      expect(mockUserRepository.getAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([singleUser]);
      expect(result).toHaveLength(1);
      expect(result[0].discordUserName).toBe("単独ユーザー");
      expect(result[0].discordAvatar).toBe("single_avatar.png");
    });

    /**
     * 異常ケース：リポジトリでエラーが発生した場合のテストケース
     *
     * @description UserRepositoryのgetAllメソッドでエラーが発生した場合、適切にエラーが伝播されることを確認
     *
     * Arrange
     * - UserRepositoryのgetAllメソッドをエラーを投げるようにモック設定
     *
     * Act & Assert
     * - GetAllUsersUseCaseのexecuteメソッド実行でエラーが発生することを確認
     * - UserRepositoryのgetAllメソッドが1回呼び出されることを確認
     */
    it("異常ケース：リポジトリでエラーが発生した場合、エラーが適切に伝播されること", async () => {
      // Arrange
      const repositoryError = new Error("データベース接続エラー");
      vi.mocked(mockUserRepository.getAll).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(getAllUsersUseCase.execute()).rejects.toThrow(
        "データベース接続エラー"
      );
      expect(mockUserRepository.getAll).toHaveBeenCalledTimes(1);
    });
  });
});
