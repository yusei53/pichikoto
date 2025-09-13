import type { User } from "./user";

export type Post = {
  id: string;
  points: number;
  message: string;
  createdAt: Date;
  sendUser: User;
  receivedUsers: User[];
  handsClapping: number;
};
