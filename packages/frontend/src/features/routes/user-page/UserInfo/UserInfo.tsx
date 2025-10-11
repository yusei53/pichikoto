import { Tag, User as UserIcon } from "lucide-react";
import { css } from "styled-system/css";
import { Box, Divider, Stack } from "styled-system/jsx";
import { Icon } from "~/components/ui/icon";
import type { User } from "~/model/user";

type UserInfoProps = {
	user: User;
};

export const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
	return (
		<Stack direction={"column"} gap={"8px"} width={"300px"}>
			<Stack direction={"row"} alignItems={"center"} gap={"8px"}>
				<Box>
					<Icon>
						<UserIcon />
					</Icon>
				</Box>
				<Box>ユーザー名</Box>
				<Box
					ml={"auto"}
					className={css({
						fontWeight: "bold",
					})}
				>
					{user.discordID}
				</Box>
			</Stack>
			<Divider />
			<Stack direction={"row"} alignItems={"center"} gap={"8px"}>
				<Box>
					<Icon>
						<Tag />
					</Icon>
				</Box>
				<Box>名前</Box>
				<Box
					ml={"auto"}
					className={css({
						fontWeight: "bold",
					})}
				>
					{user.discordUserName}
				</Box>
			</Stack>
			<Divider />
		</Stack>
	);
};
