import type {
	AllAppreciationsResponse,
	GetAllUsersResponse,
	UserInfoResponse,
} from "@pichikoto/http-contracts";
import { apiClientServer } from "~/lib/api-client-server";
import { mockUser } from "~/mock/user";
import { mockUsers } from "~/mock/user/user";
import type { Appreciation } from "~/model/appreciation";
import { toAllUsers, toAppreciations, toUserInfo } from "~/model/mapper";
import type { User, UserInfo } from "~/model/user";

export const userPageAPIServer = {
	async getCurrentUser(): Promise<User> {
		return mockUser;
	},

	async getUserByName(userName: string): Promise<UserInfo | null> {
		try {
			const result = await apiClientServer.get<UserInfoResponse>(
				`/users?name=${encodeURIComponent(userName)}`,
				{
					next: {
						tags: ["user-info"],
					},
				}
			);
			return toUserInfo(result);
		} catch (error) {
			console.error("Failed to fetch user by name:", error);
			return null;
		}
	},

	async getUserById(userId: string): Promise<User | null> {
		const found = mockUsers.find((u) => u.discordUserID === userId);
		return found ?? null;
	},

	async getUser(): Promise<User> {
		return mockUser;
	},

	async getAppreciationList(): Promise<Appreciation[]> {
		const result = await apiClientServer.get<AllAppreciationsResponse>(
			"/appreciations",
			{
				next: {
					tags: ["appreciations"],
				},
			}
		);
		return toAppreciations(result);
	},

	async getAllUsers(): Promise<User[]> {
		const userID = (await apiClientServer.getUserId()) ?? "";
		const result = await apiClientServer.get<GetAllUsersResponse>("/users", {
			next: {
				tags: ["users"],
			},
		});
		return toAllUsers(result, userID);
	},
};
