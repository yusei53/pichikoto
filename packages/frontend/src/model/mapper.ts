import type {
	AllAppreciationsResponse,
	GetAllUsersResponse,
} from "@pichikoto/http-contracts";
import type { Appreciation } from "~/model/appreciation";
import type { User } from "~/model/user";

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
