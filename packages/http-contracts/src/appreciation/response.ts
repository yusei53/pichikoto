type AppreciationUser = {
  id: string;
  discordUserName: string;
  discordGlobalName: string | null;
  discordAvatar: string;
};

type Appreciation = {
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
