import type { User } from "~/model/user";

export const mockUser: User = {
	discordUserID: "1",
	discordID: "test-user-name",
	discordUserName: "test",
	discordAvatar: "https://github.com/shadcn.png",
};

export const mockUsers: User[] = [
	mockUser,
	{ ...mockUser, discordUserID: "2" },
	{ ...mockUser, discordUserID: "3" },
];
