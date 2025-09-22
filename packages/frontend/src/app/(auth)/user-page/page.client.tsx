"use client";

import { Stack } from "styled-system/jsx";

type UserPageClientProps = {};

export const UserPageClient: React.FC<UserPageClientProps> = ({ }) => {
	return (
		<Stack direction={"row"} gap={"16px"} p={"24px"} overflowY={"hidden"}>
			<div>test</div>
		</Stack>
	);
}
