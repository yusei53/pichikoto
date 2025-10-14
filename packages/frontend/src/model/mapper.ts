import type {
	AllAppreciationsResponse,
	GetAllUsersResponse,
	GetWeeklyPointLeadersResponse,
} from "@pichikoto/http-contracts";
import type { Appreciation } from "~/model/appreciation";
import type { User } from "~/model/user";
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
					discordUserName: appreciation.sender.discordUserName,
					discordAvatar: appreciation.sender.discordAvatar,
				},
				receivers: appreciation.receivers.map((receiver) => ({
					discordUserID: receiver.id,
					discordUserName: receiver.discordUserName,
					discordAvatar: receiver.discordAvatar,
				})),
				pointPerReceiver: appreciation.pointPerReceiver,
			}) satisfies Appreciation
	);
};

export const toAllUsers = (response: GetAllUsersResponse): User[] => {
	return response.users.map((user) => ({
		discordUserID: user.discordUserID,
		discordUserName: user.discordUserName,
		discordAvatar: user.discordAvatar,
	}));
};

export const toPointLeaders = (
	response: GetWeeklyPointLeadersResponse
): PointLeaders => {
	return {
		topSenders: response.topSenders.map((sender) => ({
			userID: sender.id,
			totalPoints: sender.totalPoints,
			discordUserName: sender.discordUserName,
			discordAvatar: sender.discordAvatar,
		})),
		topReceivers: response.topReceivers.map((receiver) => ({
			userID: receiver.id,
			totalPoints: receiver.totalPoints,
			discordUserName: receiver.discordUserName,
			discordAvatar: receiver.discordAvatar,
		})),
	} satisfies PointLeaders;
};
