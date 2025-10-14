import type {
	AllAppreciationsResponse,
	GetAllUsersResponse,
	GetWeeklyPointLeadersResponse,
} from "@pichikoto/http-contracts";
import { apiClient } from "~/lib/api-client-class";
import type { Appreciation } from "~/model/appreciation";
import type { PointLeaders } from "~/model/point-leader";
import type { User } from "~/model/user";
import {
	toAllUsers,
	toAppreciations,
	toPointLeaders,
} from "../../../../model/mapper";

export const topPageAPI = {
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
		return toAllUsers(result);
	},
	async getPointLeaders(): Promise<PointLeaders> {
		const result = await apiClient.request<GetWeeklyPointLeadersResponse>(
			"/point-leaders/weekly",
			{
				method: "GET",
				next: {
					tags: ["point-leaders"],
				},
			}
		);
		return toPointLeaders(result);
	},
};
