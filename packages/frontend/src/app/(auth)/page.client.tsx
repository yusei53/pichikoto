"use client";

import { Gift, SendHorizontal } from "lucide-react";
import { Stack } from "styled-system/jsx";
import { Icon } from "~/components/ui/icon";
import { PostCard } from "~/features/common/PostCard/PostCard";
import { UserProfile } from "~/features/common/UserProfile/UserProfile";
import { PostListHeader } from "~/features/routes/top-page/PostListHeader/PostListHeader";
import { TopRanking } from "~/features/routes/top-page/TopRanking/TopRanking";
import type { PointRanking } from "~/model/point-ranking";
import type { Post } from "~/model/post";
import type { User } from "~/model/user";

type ClientTopPageProps = {
    user: User;
    posts: Post[];
    receivedPointRanking: PointRanking[];
    sendPointRanking: PointRanking[];
    isNotificationEnabled: boolean;
};

export const ClientTopPage: React.FC<ClientTopPageProps> = ({
    user,
    posts,
    receivedPointRanking,
    sendPointRanking,
    isNotificationEnabled,
}) => {
    return (
        <Stack direction={"row"} gap={"16px"}>
            <Stack direction={"column"} gap={"24px"} width={"750px"}>
                <UserProfile
                    userID={user.userID}
                    userName={user.discordUserName}
                    avatarUrl={user.discordAvatar}
                    isNotificationEnabled={isNotificationEnabled}
                />
                <Stack direction={"row"} gap={"16px"}>
                    <TopRanking
                        titleIcon={
                            <Icon color={"blush"}>
                                <SendHorizontal />
                            </Icon>
                        }
                        title="今週送ったランキング"
                        rankingUsers={sendPointRanking}
                    />
                    <TopRanking
                        titleIcon={
                            <Icon color={"sage"}>
                                <Gift />
                            </Icon>
                        }
                        title="今週もらったランキング"
                        rankingUsers={receivedPointRanking}
                    />
                </Stack>
            </Stack>
            <Stack direction={"column"} width={"100%"}>
                <PostListHeader onSearchChange={() => {}} />
                <Stack direction={"column"} gap={"16px"}>
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </Stack>
            </Stack>
        </Stack>
    );
};
