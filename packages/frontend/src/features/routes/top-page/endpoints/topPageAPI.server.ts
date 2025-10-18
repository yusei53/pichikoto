import type {
	AllAppreciationsResponse,
	GetAllUsersResponse,
	GetWeeklyPointLeadersResponse,
	UserInfoResponse,
} from "@pichikoto/http-contracts";
import { apiClientServer } from "~/lib/api-client-server";
import type { Appreciation } from "~/model/appreciation";
import {
	toAllUsers,
	toAppreciations,
	toPointLeaders,
	toUserInfo,
} from "~/model/mapper";
import type { PointLeaders } from "~/model/point-leader";
import type { User } from "~/model/user";

export const topPageAPIServer = {
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
	async getUserInfo(): Promise<UserInfoResponse> {
		const userID = (await apiClientServer.getUserId()) ?? "";
		const result = await apiClientServer.get(`/users/${userID}`, {
			next: {
				tags: ["users", userID],
			},
		});
		return toUserInfo(result);
	},
	async getPointLeaders(): Promise<PointLeaders> {
		const result = await apiClientServer.get<GetWeeklyPointLeadersResponse>(
			"/point-leaders/weekly",
			{
				next: {
					tags: ["point-leaders"],
				},
			}
		);
		return toPointLeaders(result);
	},
};
