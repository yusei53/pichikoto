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
					revalidate: 30, // 30秒キャッシュ（頻繁に更新される）
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
				revalidate: 300, // 5分キャッシュ（ユーザー情報は変わりにくい）
			},
		});
		return toAllUsers(result, userID);
	},
	async getUserInfo(): Promise<UserInfoResponse> {
		const userID = (await apiClientServer.getUserId()) ?? "";
		const result = await apiClientServer.get(`/users/${userID}`, {
			next: {
				tags: ["users", userID],
				revalidate: 60, // 1分キャッシュ（ポイントが変わる）
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
					revalidate: 60, // 1分キャッシュ
				},
			}
		);
		return toPointLeaders(result);
	},
};
