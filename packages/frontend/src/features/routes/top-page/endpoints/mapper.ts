import type { AllAppreciationsResponse } from "@pichikoto/http-contracts";
import type { Appreciation } from "~/model/appreciation";

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
					userID: appreciation.sender.id,
					discordID: appreciation.sender.id,
					discordUserName: appreciation.sender.discordAvatar,
					discordAvatar: appreciation.sender.discordAvatar,
				},
				receivers: appreciation.receivers.map((receiver) => ({
					userID: receiver.id,
					discordID: receiver.id,
					discordUserName: receiver.discordAvatar,
					discordAvatar: receiver.discordAvatar,
				})),
				pointPerReceiver: appreciation.pointPerReceiver,
			}) satisfies Appreciation
	);
};
