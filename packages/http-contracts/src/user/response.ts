export type GetAllUsersResponse = {
  users: UserResponse[];
};

export type UserResponse = {
  discordUserID: string;
  discordUserName: string;
  discordGlobalName: string | null;
  discordAvatar: string;
};
