import { SendHorizontal } from "lucide-react";
import Image from "next/image";
import { css } from "styled-system/css";
import { Box, Stack } from "styled-system/jsx";
import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Icon } from "~/components/ui/icon";
import { Popover } from "~/components/ui/popover";
import { usePopover } from "~/components/ui/usePopover";
import { formatDate } from "~/lib/date-helper";
import type { Appreciation } from "~/model/appreciation";
import useDisplayReceivedUsers from "./useDisplayReceivedUsers";

type AppreciationCardProps = {
	appreciation: Appreciation;
};

export const AppreciationCard: React.FC<AppreciationCardProps> = ({ appreciation }) => {
	const { displayReceivedUsers, hiddenReceivedUsersCount } = useDisplayReceivedUsers(
		appreciation.receivedUsers
	);
	const { isOpen, onTriggerEnter, onTriggerLeave, onContentEnter, onContentLeave } = usePopover();
	return (
		<Card.Root
			className={css({
				boxShadow: "none",
				border: "2px solid",
				borderColor: "border",
			})}
		>
			<Card.Header>
				<Stack direction={"row"} alignItems={"center"} gap={"24px"}>
					<Stack direction={"row"} alignItems={"center"}>
						<Avatar size={"xl"} src={appreciation.sendUser.discordAvatar} />
						<Stack gap={"4px"}>
							<Box>{appreciation.sendUser.discordUserName}</Box>
							<Box>{appreciation.sendUser.discordID}</Box>
						</Stack>
					</Stack>
					<Icon size={"lg"}>
						<SendHorizontal />
					</Icon>
					<Popover.Root
						open={isOpen}
						positioning={{
							placement: "right",
						}}
					>
						<Popover.Trigger onMouseEnter={onTriggerEnter} onMouseLeave={onTriggerLeave}>
							<Stack direction={"row"} alignItems={"center"} gap={"16px"}>
								{displayReceivedUsers.map((user) => (
									<Stack direction={"column"} alignItems={"center"} gap={"4px"} key={user.userID}>
										<Avatar size={"xl"} src={user.discordAvatar} />
										<Box>{user.discordUserName}</Box>
									</Stack>
								))}
								{hiddenReceivedUsersCount > 0 && (
									<Box
										className={css({
											fontSize: "2xl",
										})}
									>
										他{hiddenReceivedUsersCount}人
									</Box>
								)}
								<Box
									className={css({
										fontSize: "3xl",
									})}
								>
									+{appreciation.points}pt
								</Box>
							</Stack>
						</Popover.Trigger>
						<Popover.Positioner
							maxH={"200px"}
							overflowY={"auto"}
							boxShadow={"md"}
							bgColor={"white"}
							onMouseEnter={onContentEnter}
							onMouseLeave={onContentLeave}
						>
							<Popover.Arrow>
								<Popover.ArrowTip />
							</Popover.Arrow>
							<Popover.Content>
								<Stack direction={"column"} gap={"16px"} p={"8px"}>
									{appreciation.receivedUsers.map((user) => (
										<Stack direction={"row"} alignItems={"center"} gap={"16px"} key={user.userID}>
											<Avatar size={"xl"} src={user.discordAvatar} />
											<Stack direction={"column"} gap={"8px"}>
												<Box>{user.discordUserName}</Box>
												<Box>{user.discordID}</Box>
											</Stack>
										</Stack>
									))}
								</Stack>
							</Popover.Content>
						</Popover.Positioner>
					</Popover.Root>
					<Box ml={"auto"}>{formatDate(appreciation.createdAt)}</Box>
				</Stack>
			</Card.Header>
			<Card.Body>
				<Box>{appreciation.message}</Box>
			</Card.Body>
			<Card.Footer>
				<Stack direction={"row"} alignItems={"center"} gap={"4px"}>
					<Box color={"sage"}>{appreciation.handsClapping}</Box>
					<Button variant={"ghost"} px={"0"}>
						<Image src="/hands-clapping.png" alt="hands-clapping" width={30} height={30} />
					</Button>
				</Stack>
			</Card.Footer>
		</Card.Root>
	);
};
