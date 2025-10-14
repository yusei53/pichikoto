import { Gift, SendHorizontal } from "lucide-react";
import { css } from "styled-system/css";
import { Box, Divider, Stack } from "styled-system/jsx";
import { Avatar } from "~/components/ui/avatar";
import { Card } from "~/components/ui/card";
import { Icon } from "~/components/ui/icon";
import type { User } from "~/model/user";

type AppreciationLogProps = {
	targetUsr: User;
	sendUserList: User[];
	receivedUserList: User[];
};

export const AppreciationLog: React.FC<AppreciationLogProps> = ({
	targetUsr,
	sendUserList,
	receivedUserList,
}) => {
	return (
		<Card.Root
			className={css({
				boxShadow: "none",
				border: "2px solid",
				borderColor: "border",
				p: "16px",
			})}
			width={"300px"}
		>
			<Card.Body pt={"16px"}>
				<Stack direction={"column"} gap={"16px"}>
					<Box>{targetUsr.discordUserName}さんが</Box>

					<Stack direction={"column"} gap={"8px"}>
						<Stack direction={"row"} gap={"8px"} alignItems={"center"}>
							<Icon color={"blush"}>
								<SendHorizontal />
							</Icon>
							<Box>今まで送ったユーザー</Box>
						</Stack>
						<Divider />
						<Stack
							direction={"row"}
							gap={"4px"}
							alignItems={"center"}
							flexWrap={"wrap"}
						>
							{sendUserList.map((u) => (
								<Avatar
									key={u.discordUserID}
									size={"xl"}
									src={u.discordAvatar}
									name={u.discordUserName}
								/>
							))}
						</Stack>
					</Stack>

					<Stack direction={"column"} gap={"8px"}>
						<Stack direction={"row"} gap={"8px"} alignItems={"center"}>
							<Icon color={"sage"}>
								<Gift />
							</Icon>
							<Box>今までもらったユーザー</Box>
						</Stack>
						<Divider />
						<Stack
							direction={"row"}
							gap={"4px"}
							alignItems={"center"}
							flexWrap={"wrap"}
						>
							{receivedUserList.map((u) => (
								<Avatar
									key={u.discordUserID}
									size={"xl"}
									src={u.discordAvatar}
									name={u.discordUserName}
								/>
							))}
						</Stack>
					</Stack>
				</Stack>
			</Card.Body>
		</Card.Root>
	);
};
