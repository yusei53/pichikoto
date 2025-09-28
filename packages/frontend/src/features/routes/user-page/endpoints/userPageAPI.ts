import { mockUser } from "~/mock/user";
import { mockUsers } from "~/mock/user/user";
import type { User } from "~/model/user";

export const userPageAPI = {
  async getCurrentUser(): Promise<User> {
    return mockUser;
  },

  async getUserById(userId: string): Promise<User | null> {
    const found = mockUsers.find((u) => u.userID === userId);
    return found ?? null;
  },

  async getUser(): Promise<User> {
    return mockUser;
  }
};
