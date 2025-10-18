import { SendHorizontal } from "lucide-react";
import Link from "next/link";
import { css } from "styled-system/css";
import { Box, Stack } from "styled-system/jsx";
import { Avatar } from "~/components/ui/avatar";
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

export const AppreciationCard: React.FC<AppreciationCardProps> = ({
	appreciation,
}) => {
	const { displayReceivedUsers, hiddenReceivedUsersCount } =
		useDisplayReceivedUsers(appreciation.receivers);
	const {
		isOpen,
		onTriggerEnter,
		onTriggerLeave,
		onContentEnter,
		onContentLeave,
	} = usePopover();
	return (
		<Card.Root
			className={css({
				boxShadow:
					"rgba(0, 0, 0, 0.05) 0px 2px 4px, rgba(0, 0, 0, 0.03) 0px 1px 1px",
				border: "1px solid",
				borderColor: "border",
				position: "relative",
			})}
		>
			<Card.Header>
				<Stack direction={"row"} alignItems={"center"} gap={"24px"}>
					<Link href={`/${appreciation.sender.discordUserName}`}>
						<Stack
							direction={"column"}
							alignItems={"center"}
							gap={"4px"}
							cursor="pointer"
						>
							<Avatar size={"xl"} src={appreciation.sender.discordAvatar} />
							{appreciation.sender.discordGlobalName !== null ? (
								<Box>{appreciation.sender.discordGlobalName}</Box>
							) : (
								<Box>{appreciation.sender.discordUserName}</Box>
							)}
						</Stack>
					</Link>
					<Icon size={"lg"}>
						<SendHorizontal />
					</Icon>
					<Popover.Root
						open={isOpen}
						positioning={{
							placement: "right",
						}}
					>
						<Popover.Trigger
							onMouseEnter={onTriggerEnter}
							onMouseLeave={onTriggerLeave}
							className={css({
								outline: "none",
							})}
						>
							<Stack direction={"row"} alignItems={"center"} gap={"16px"}>
								{displayReceivedUsers.map((user) => (
									<Link
										href={`/${user.discordUserName}`}
										key={user.discordUserID}
									>
										<Stack
											direction={"column"}
											alignItems={"center"}
											gap={"4px"}
											cursor="pointer"
										>
											<Avatar size={"xl"} src={user.discordAvatar} />
											{user.discordGlobalName !== null ? (
												<Box>{user.discordGlobalName}</Box>
											) : (
												<Box>{user.discordUserName}</Box>
											)}
										</Stack>
									</Link>
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
									+{appreciation.pointPerReceiver}pt
								</Box>
							</Stack>
						</Popover.Trigger>
						<Popover.Positioner
							maxH={"150px"}
							overflowY={"auto"}
							boxShadow={"md"}
							bgColor={"white"}
							onMouseEnter={onContentEnter}
							onMouseLeave={onContentLeave}
						>
							<Popover.Arrow>
								<Popover.ArrowTip />
							</Popover.Arrow>
							<Popover.Content
								className={css({
									outline: "none",
								})}
							>
								<Stack direction={"column"} gap={"16px"} p={"8px"}>
									{appreciation.receivers.map((user) => (
										<Link
											href={`/${user.discordUserName}`}
											key={user.discordUserID}
											className={css({
												outline: "none",
											})}
										>
											<Stack
												direction={"row"}
												alignItems={"center"}
												gap={"16px"}
												cursor="pointer"
											>
												<Avatar size={"xl"} src={user.discordAvatar} />
												<Stack direction={"column"} gap={"8px"}>
													{user.discordGlobalName !== null ? (
														<Box>{user.discordGlobalName}</Box>
													) : (
														<Box>{user.discordUserName}</Box>
													)}
												</Stack>
											</Stack>
										</Link>
									))}
								</Stack>
							</Popover.Content>
						</Popover.Positioner>
					</Popover.Root>
				</Stack>
			</Card.Header>
			<Box position="absolute" top="16px" right="24px">
				{formatDate(appreciation.createdAt)}
			</Box>
			<Card.Body>
				<Box>{appreciation.message}</Box>
			</Card.Body>
		</Card.Root>
	);
};
