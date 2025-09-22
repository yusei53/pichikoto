// バックエンドのAuthPayloadDTOと整合性を保つ認証関連の型定義

export type UserDTO = {
	id: string;
	discordUserName: string;
	discordAvatar: string;
};

export type AuthPayload = {
	user: UserDTO;
	accessToken: string;
	refreshToken: string;
};

export type AuthError = {
	error: string;
};
