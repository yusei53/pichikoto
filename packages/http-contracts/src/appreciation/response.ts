export type AppreciationUser = {
  id: string;
  discordUserName: string;
  discordAvatar: string;
};

export type Appreciation = {
  id: string;
  sender: AppreciationUser;
  receivers: AppreciationUser[];
  message: string;
  pointPerReceiver: number;
  createdAt: string;
};

export type AllAppreciationsResponse = {
  appreciations: Appreciation[];
};
