import { Crown } from "lucide-react";
import Link from "next/link";
import { Box, Divider, Stack } from "styled-system/jsx";
import { Avatar } from "~/components/ui/avatar";
import { Icon } from "~/components/ui/icon";
import type { PointLeaderUser } from "~/model/point-leader";
import { useGetAvatarSize } from "./useGetAvatarSize";

type TopRankingProps = {
	titleIcon: React.ReactNode;
	title: string;
	rankingUsers: PointLeaderUser[];
};

export const TopRanking: React.FC<TopRankingProps> = ({
	titleIcon,
	title,
	rankingUsers,
}) => {
	const { getAvatarSize } = useGetAvatarSize();
	return (
		<Stack direction={"row"} gap={"16px"} alignItems={"center"} px={"16px"}>
			<Stack direction={"column"} gap={"8px"}>
				<Stack direction={"row"} gap={"10px"} alignItems={"center"}>
					<Icon>{titleIcon}</Icon>
					<Box fontSize={"md"}>{title}</Box>
				</Stack>
				<Box>
					<Divider />
				</Box>
			</Stack>
			<Stack direction={"row"} gap={"24px"} alignItems={"center"}>
				{rankingUsers.map((user, index) => (
					<Link href={`/${user.discordUserName}`} key={user.userID}>
						<Stack
							direction={"column"}
							alignItems={"center"}
							mt={"auto"}
							cursor="pointer"
						>
							<Icon>
								<Crown />
							</Icon>
							<Box>
								<Avatar size={getAvatarSize(index)} src={user.discordAvatar} />
							</Box>
							<Box mt={"auto"} fontWeight={"bold"}>
								{user.totalPoints}pt
							</Box>
						</Stack>
					</Link>
				))}
			</Stack>
		</Stack>
	);
};
