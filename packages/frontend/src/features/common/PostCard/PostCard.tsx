import { SendHorizontal } from "lucide-react";
import Image from "next/image";
import { css } from "styled-system/css";
import { Box, Stack } from "styled-system/jsx";
import { Avatar } from "~/components/ui/avatar";
import { Card } from "~/components/ui/card";
import { Icon } from "~/components/ui/icon";
import { Popover } from "~/components/ui/popover";
import { usePopover } from "~/components/ui/usePopover";
import { formatDate } from "~/lib/date-helper";
import { Post } from "~/model/post";
import useDisplayReceivedUsers from "./useDisplayReceivedUsers";

type PostCardProps = {
    post: Post;
};

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const { displayReceivedUsers, hiddenReceivedUsersCount } = useDisplayReceivedUsers(
        post.receivedUsers
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
                        <Avatar size={"xl"} src={post.sendUser.discordAvatar} />
                        <Stack gap={"4px"}>
                            <Box>{post.sendUser.discordUserName}</Box>
                            <Box>{post.sendUser.discordID}</Box>
                        </Stack>
                    </Stack>
                    <Icon size={"lg"}>
                        <SendHorizontal />
                    </Icon>
                    <Popover.Root open={isOpen}>
                        <Popover.Trigger
                            onMouseEnter={onTriggerEnter}
                            onMouseLeave={onTriggerLeave}
                        >
                            <Stack direction={"row"} alignItems={"center"} gap={"8px"}>
                                {displayReceivedUsers.map((user) => (
                                    <Stack direction={"column"} alignItems={"center"} gap={"4px"}>
                                        <Avatar size={"xl"} src={user.discordAvatar} />
                                        <Box>{user.discordUserName}</Box>
                                    </Stack>
                                ))}
                                {hiddenReceivedUsersCount > 0 && (
                                    <Box>
                                        <span
                                            className={css({
                                                fontSize: "3xl",
                                            })}
                                        >
                                            +{hiddenReceivedUsersCount}
                                        </span>
                                    </Box>
                                )}
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
                            <Popover.Content>
                                <Stack direction={"column"} gap={"16px"} p={"8px"}>
                                    {post.receivedUsers.map((user) => (
                                        <Stack direction={"row"} alignItems={"center"} gap={"16px"}>
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
                    <Box ml={"auto"}>{formatDate(post.createdAt)}</Box>
                </Stack>
            </Card.Header>
            <Card.Body>
                <Box>{post.message}</Box>
            </Card.Body>
            <Card.Footer>
                <Stack direction={"row"} alignItems={"center"} gap={"8px"}>
                    <Box color={"sage"}>{post.handsClapping}</Box>
                    <Box>
                        <Image
                            src="/hands-clapping.png"
                            alt="hands-clapping"
                            width={30}
                            height={30}
                        />
                    </Box>
                </Stack>
            </Card.Footer>
        </Card.Root>
    );
};
