import { Crown } from "lucide-react";
import { Box, Divider, Stack } from "styled-system/jsx";
import { Avatar } from "~/components/ui/avatar";
import { Icon } from "~/components/ui/icon";
import { useGetAvatarSize } from "./useGetAvatarSize";

type RankingUser = {
    userID: string;
    point: number;
    avatarUrl: string;
}

type TopRankingProps = {
    titleIcon: React.ReactNode;
    title: string;
    rankingUsers: RankingUser[];
}

export const TopRanking: React.FC<TopRankingProps> = ({ titleIcon, title, rankingUsers }) => {
    const { getAvatarSize } = useGetAvatarSize();
    return (
        <Stack direction={"column"} gap={"16px"} >
            <Stack direction={"column"} gap={"8px"} >
                <Stack direction={"row"} gap={"10px"} alignItems={"center"}>
                    <Icon>
                        {titleIcon}
                    </Icon>
                    <Box fontSize={"xl"} fontWeight={"bold"}>{title}</Box>
                </Stack>
                <Box>
                    <Divider pt={"16"} />
                </Box>
            </Stack>
            <Stack direction={"row"} gap={"24px"} alignItems={"center"}>
                {rankingUsers.map((user, index) => (
                    <Stack key={user.userID} direction={"column"} alignItems={"center"} minH={"200px"} mt={"auto"} >
                        <Icon>
                            <Crown />
                        </Icon>
                        <Box>
                            <Avatar size={getAvatarSize(index)} src={user.avatarUrl} />
                        </Box>
                        <Box mt={"auto"} fontWeight={"bold"}>{user.point}pt</Box>
                    </Stack>
                ))}
            </Stack>
        </Stack>
    )
}