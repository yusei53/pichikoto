import { User } from "../entities/user";

export class UserRepository {
  async save(user: User): Promise<User> {
    // 仮実装: DB保存の代わりにそのまま返す
    return user;
  }
} 