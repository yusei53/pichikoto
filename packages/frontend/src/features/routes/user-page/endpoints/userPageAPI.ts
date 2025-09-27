import { mockUser } from "~/mock/user";
import type { User } from "~/model/user";

export const userPageAPI = {
	async getUser(): Promise<User> {
		return mockUser;
	},
};
