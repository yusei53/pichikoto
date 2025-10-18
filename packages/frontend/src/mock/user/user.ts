import type { User, UserInfo } from "~/model/user";

export const mockUser: User = {
	discordUserID: "1",
	discordUserName: "test",
	discordGlobalName: "test",
	discordAvatar: "https://github.com/shadcn.png",
};

export const mockUserInfo: UserInfo = {
	...mockUser,
	remainingPoints: 100,
};

export const mockUsers: User[] = [
	mockUser,
	{ ...mockUser, discordUserID: "2" },
	{ ...mockUser, discordUserID: "3" },
];
