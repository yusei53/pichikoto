import { UserRepository } from "../repositories/userRepository";
import { User } from "../entities/user";
import { v4 as uuidv4 } from "uuid";
import { CreateUserRequest } from "./request/userRequest";
import { CreateUserResponse } from "./response/userResponse";

export class UserUsecase {
  constructor(private userRepository: UserRepository) {}

  async createUser(req: CreateUserRequest): Promise<CreateUserResponse> {
    const user: User = {
      id: uuidv4(),
      name: req.name,
      email: req.email,
    };
    const savedUser = await this.userRepository.save(user);
    return { user: savedUser };
  }
}