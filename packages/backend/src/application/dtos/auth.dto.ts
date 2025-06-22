import type { User } from "../../domain/models/User";

// 認証後のレスポンス
export type AuthPayloadDTO = {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
};

export const toAuthPayloadDTO = (
  user: User,
  accessToken: string,
  refreshToken: string
): AuthPayloadDTO => {
  return {
    user: toUserDTO(user),
    accessToken: accessToken,
    refreshToken: refreshToken
  };
};

// フロントエンドに返すユーザー情報
export type UserDTO = {
  id: string;
  discordUserName: string;
  discordAvatar: string;
  faculty: string;
  department: string;
};

export const toUserDTO = (user: User): UserDTO => {
  return {
    id: user.userID.value.value,
    discordUserName: user.discordUserName,
    discordAvatar: user.discordAvatar,
    faculty: user.faculty?.getValue() ?? "",
    department: user.department?.getValue() ?? ""
  };
};
