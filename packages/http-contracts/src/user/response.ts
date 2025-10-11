export type GetAllUsersResponse = {
  users: UserResponse[];
};

export type UserResponse = {
  userID: string;
  discordID: string;
  discordUserName: string;
  discordAvatar: string;
};
