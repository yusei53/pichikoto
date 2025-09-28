"use client";

import { Stack } from "styled-system/jsx";
import type { User } from "~/model/user";

type UserPageClientProps = {
	user: User;
	isOwnUser: boolean;
};

export const UserPageClient: React.FC<UserPageClientProps> = ({ user, isOwnUser }) => {
	return (
		<Stack direction={"row"} gap={"16px"} p={"24px"} overflowY={"hidden"}>
			<div>{user.discordUserName} {isOwnUser ? "(you)" : ""}</div>
		</Stack>
	);
}
