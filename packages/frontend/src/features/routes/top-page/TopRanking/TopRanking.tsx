import { Crown } from "lucide-react";
import { Box, Divider, Stack } from "styled-system/jsx";
import { Avatar } from "~/components/ui/avatar";
import { Icon } from "~/components/ui/icon";
import type { PointRanking } from "~/model/point-ranking";
import { useGetAvatarSize } from "./useGetAvatarSize";

type TopRankingProps = {
	titleIcon: React.ReactNode;
	title: string;
	rankingUsers: PointRanking[];
};

export const TopRanking: React.FC<TopRankingProps> = ({ titleIcon, title, rankingUsers }) => {
	const { getAvatarSize } = useGetAvatarSize();
	return (
		<Stack direction={"column"} gap={"16px"}>
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
					<Stack key={user.userID} direction={"column"} alignItems={"center"} mt={"auto"}>
						<Icon>
							<Crown />
						</Icon>
						<Box>
							<Avatar size={getAvatarSize(index)} src={user.avatarUrl} />
						</Box>
						<Box mt={"auto"} fontWeight={"bold"}>
							{user.point}pt
						</Box>
					</Stack>
				))}
			</Stack>
		</Stack>
	);
};
