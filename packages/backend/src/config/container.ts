import { UserRepository } from "../repositories/userRepository";
import { UserUsecase } from "../usecase/userUsecase";
import { UserController } from "../controllers/userController";

const userRepository = new UserRepository();
const userUsecase = new UserUsecase(userRepository);
export const userController = new UserController(userUsecase);