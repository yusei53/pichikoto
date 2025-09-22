import type { User } from "~/model/user";

export const mockUser: User = {
	userID: "1",
	discordID: "test-user-name",
	discordUserName: "test",
	discordAvatar: "https://github.com/shadcn.png",
};

export const mockUsers: User[] = [
	mockUser,
	{ ...mockUser, userID: "2" },
	{ ...mockUser, userID: "3" },
];
