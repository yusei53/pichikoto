export type User = {
	discordUserID: string;
	discordUserName: string;
	discordGlobalName: string | null;
	discordAvatar: string;
};

export type UserInfo = User & {
	remainingPoints: number;
};
