import type {
	AllAppreciationsResponse,
	CreateAppreciationRequest,
	GetAllUsersResponse,
} from "@pichikoto/http-contracts";
import { apiClient } from "~/lib/api-client-class";
import { mockUser } from "~/mock/user";
import { mockUsers } from "~/mock/user/user";
import type { Appreciation } from "~/model/appreciation";
import { toAllUsers, toAppreciations } from "~/model/mapper";
import type { User } from "~/model/user";

export const userPageAPI = {
	async getCurrentUser(): Promise<User> {
		return mockUser;
	},

	async getUserById(userId: string): Promise<User | null> {
		const found = mockUsers.find((u) => u.discordUserID === userId);
		return found ?? null;
	},

	async postAppreciation(
		appreciation: CreateAppreciationRequest
	): Promise<void> {
		await apiClient.post<void>("/appreciations", appreciation);
	},

	async getUser(): Promise<User> {
		return mockUser;
	},

	async getAppreciationList(): Promise<Appreciation[]> {
		const result = await apiClient.request<AllAppreciationsResponse>(
			"/appreciations",
			{
				method: "GET",
				next: {
					tags: ["appreciations"],
				},
			}
		);
		return toAppreciations(result);
	},

	async getAllUsers(): Promise<User[]> {
		const result = await apiClient.request<GetAllUsersResponse>("/users", {
			method: "GET",
			next: {
				tags: ["users"],
			},
		});
		return toAllUsers(result, "");
	},
};
