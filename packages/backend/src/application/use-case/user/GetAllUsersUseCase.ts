import type { User } from "../../../domain/user/User";
import type { UserRepositoryInterface } from "../../../infrastructure/repositories/UserRepository";

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  async execute(): Promise<User[]> {
    return this.userRepository.getAll();
  }
}
