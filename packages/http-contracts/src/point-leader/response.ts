type PointLeaderUserResponse = {
  id: string;
  discordUserName: string;
  discordAvatar: string;
  totalPoints: number;
};

export type GetWeeklyPointLeadersResponse = {
  topSenders: PointLeaderUserResponse[];
  topReceivers: PointLeaderUserResponse[];
};


