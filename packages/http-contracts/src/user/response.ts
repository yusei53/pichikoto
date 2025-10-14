export type GetAllUsersResponse = {
  users: UserResponse[];
};

export type UserResponse = {
  discordUserID: string;
  discordUserName: string;
  discordAvatar: string;
};
