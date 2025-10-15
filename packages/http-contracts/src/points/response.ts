export type GetAppreciationTotalPointResponse = {
  sentPoint: number;
  receivedPoint: number;
};

type AppreciationUser = {
  id: string;
  discordUserName: string;
  discordGlobalName: string | null;
  discordAvatar: string;
};

export type GetAppreciationUsersResponse = {
  sentToUsers: AppreciationUser[];
  receivedFromUsers: AppreciationUser[];
};
