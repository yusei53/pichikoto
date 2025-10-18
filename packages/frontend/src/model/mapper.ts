import type {
	AllAppreciationsResponse,
	GetAllUsersResponse,
	GetWeeklyPointLeadersResponse,
	UserInfoResponse,
} from "@pichikoto/http-contracts";
import type { Appreciation } from "~/model/appreciation";
import type { User, UserInfo } from "~/model/user";
import type { PointLeaders } from "./point-leader";

export const toAppreciations = (
	response: AllAppreciationsResponse
): Appreciation[] => {
	return response.appreciations.map(
		(appreciation) =>
			({
				id: appreciation.id,
				message: appreciation.message,
				createdAt: new Date(appreciation.createdAt),
				sender: {
					discordUserID: appreciation.sender.id,
					discordGlobalName: appreciation.sender.discordGlobalName,
					discordUserName: appreciation.sender.discordUserName,
					discordAvatar: `https://cdn.discordapp.com/avatars/${appreciation.sender.id}/${appreciation.sender.discordAvatar}.png`,
				},
				receivers: appreciation.receivers.map((receiver) => ({
					discordUserID: receiver.id,
					discordGlobalName: receiver.discordGlobalName,
					discordUserName: receiver.discordUserName,
					discordAvatar: `https://cdn.discordapp.com/avatars/${receiver.id}/${receiver.discordAvatar}.png`,
				})),
				pointPerReceiver: appreciation.pointPerReceiver,
			}) satisfies Appreciation
	);
};

export const toAllUsers = (
	response: GetAllUsersResponse,
	currentUserID: string
): User[] => {
	return response.users
		.map((user) => ({
			discordUserID: user.discordUserID,
			discordUserName: user.discordUserName,
			discordGlobalName: user.discordGlobalName,
			discordAvatar: `https://cdn.discordapp.com/avatars/${user.discordUserID}/${user.discordAvatar}.png`,
		}))
		.filter((user) => user.discordUserID !== currentUserID);
};

export const toUserInfo = (response: UserInfoResponse): UserInfo => {
	return {
		discordUserID: response.discordUserID,
		discordUserName: response.discordUserName,
		discordGlobalName: response.discordGlobalName,
		discordAvatar: `https://cdn.discordapp.com/avatars/${response.discordUserID}/${response.discordAvatar}.png`,
		remainingPoints: response.remainingPoints,
	} satisfies UserInfo;
};

export const toPointLeaders = (
	response: GetWeeklyPointLeadersResponse
): PointLeaders => {
	return {
		topSenders: response.topSenders.map((sender) => ({
			userID: sender.id,
			totalPoints: sender.totalPoints,
			discordUserName: sender.discordUserName,
			discordAvatar: `https://cdn.discordapp.com/avatars/${sender.id}/${sender.discordAvatar}.png`,
		})),
		topReceivers: response.topReceivers.map((receiver) => ({
			userID: receiver.id,
			totalPoints: receiver.totalPoints,
			discordUserName: receiver.discordUserName,
			discordAvatar: `https://cdn.discordapp.com/avatars/${receiver.id}/${receiver.discordAvatar}.png`,
		})),
	} satisfies PointLeaders;
};
