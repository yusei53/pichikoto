export type PointLeaderUser = {
	userID: string;
	totalPoints: number;
	discordUserName: string;
	discordAvatar: string;
};

export type PointLeaders = {
	topSenders: PointLeaderUser[];
	topReceivers: PointLeaderUser[];
};
