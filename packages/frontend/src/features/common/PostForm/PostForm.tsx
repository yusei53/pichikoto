import { CheckIcon, ChevronsUpDownIcon, SendHorizontal } from "lucide-react";
import { css } from "styled-system/css";
import { Box, Divider, Stack } from "styled-system/jsx";
import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Combobox } from "~/components/ui/combobox";
import { Field } from "~/components/ui/field";
import { Icon } from "~/components/ui/icon";
import { IconButton } from "~/components/ui/icon-button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import type { User } from "~/model/user";
import { usePostForm } from "./usePostForm";

type PostFormProps = {
    users: User[];
    remainingPoints: number;
};

export const PostForm: React.FC<PostFormProps> = ({ users, remainingPoints }) => {
    const {
        register,
        onSubmit,
        onSendUserChange,
        onPointsChange,
        errors,
        usersCollection,
        pointsCollection,
        currentSendUsers,
        currentPoints,
    } = usePostForm({ users, remainingPoints });

    return (
        <form onSubmit={onSubmit}>
            <Card.Root
                className={css({
                    boxShadow: "none",
                    border: "2px solid",
                    borderColor: "border",
                    py: "24px",
                })}
            >
                <Card.Body>
                    <Stack direction={"column"} gap={"16px"}>
                        <Combobox.Root
                            multiple
                            collection={usersCollection}
                            onValueChange={onSendUserChange}
                        >
                            <Field.Root invalid={!!errors.sendUserID}>
                                <Combobox.Control>
                                    <Combobox.Input placeholder="送る人を選択" asChild>
                                        <Field.Input asChild>
                                            <Input />
                                        </Field.Input>
                                    </Combobox.Input>
                                    <Combobox.Trigger asChild>
                                        <IconButton variant="link" aria-label="open" size="xs">
                                            <ChevronsUpDownIcon />
                                        </IconButton>
                                    </Combobox.Trigger>
                                </Combobox.Control>
                                <Field.ErrorText>{errors.sendUserID?.message}</Field.ErrorText>
                            </Field.Root>
                            <Combobox.Positioner>
                                <Combobox.Content>
                                    <Combobox.ItemGroup>
                                        {usersCollection.items.map((item) => (
                                            <Combobox.Item key={item.value} item={item}>
                                                <Stack
                                                    direction={"row"}
                                                    alignItems={"center"}
                                                    gap={"8px"}
                                                    p={"8px"}
                                                >
                                                    <Avatar size={"sm"} src={item.avatarUrl} />
                                                    <Combobox.ItemText>
                                                        {item.label}
                                                    </Combobox.ItemText>
                                                    <Combobox.ItemText>
                                                        {item.value}
                                                    </Combobox.ItemText>
                                                </Stack>
                                                <Combobox.ItemIndicator>
                                                    <CheckIcon />
                                                </Combobox.ItemIndicator>
                                            </Combobox.Item>
                                        ))}
                                    </Combobox.ItemGroup>
                                </Combobox.Content>
                            </Combobox.Positioner>
                        </Combobox.Root>
                        <Stack direction={"row"} alignItems={"center"} gap={"16px"}>
                            {currentSendUsers.map((user) => (
                                <Stack
                                    direction={"column"}
                                    alignItems={"center"}
                                    gap={"4px"}
                                    key={user.userID}
                                >
                                    <Avatar size={"sm"} src={user.discordAvatar} />
                                    <Box>{user.discordUserName}</Box>
                                </Stack>
                            ))}
                        </Stack>
                        <Divider />
                        <Field.Root invalid={!!errors.message}>
                            <Field.Input asChild>
                                <Textarea minH={"200px"} {...register("message")} />
                            </Field.Input>
                            <Field.ErrorText>{errors.message?.message}</Field.ErrorText>
                        </Field.Root>
                        <Divider />
                        <Stack direction={"column"} gap={"16px"}>
                            <Stack direction={"column"} gap={"4px"}>
                                <Stack direction={"row"} alignItems={"center"} gap={"16px"}>
                                    <Box>今週残ポイント</Box>
                                    <Box ml={"auto"}>{remainingPoints}pt</Box>
                                </Stack>
                                <Divider mb={"16px"} />
                                <Combobox.Root
                                    collection={pointsCollection}
                                    onValueChange={onPointsChange}
                                >
                                    <Field.Root invalid={!!errors.points}>
                                        <Combobox.Control>
                                            <Field.Input asChild>
                                                <Combobox.Input placeholder="ポイントを選択" asChild>
                                                    <Input />
                                                </Combobox.Input>
                                            </Field.Input>
                                            <Combobox.Trigger asChild>
                                                <IconButton variant="link" aria-label="open" size="xs">
                                                    <ChevronsUpDownIcon />
                                                </IconButton>
                                            </Combobox.Trigger>
                                        </Combobox.Control>
                                        <Field.ErrorText>{errors.points?.message}</Field.ErrorText>
                                    </Field.Root>
                                    <Combobox.Positioner>
                                        <Combobox.Content>
                                            <Combobox.ItemGroup>
                                                {pointsCollection.items.map((item) => (
                                                    <Combobox.Item key={item.value} item={item}>
                                                        <Combobox.ItemText>
                                                            {item.label}
                                                        </Combobox.ItemText>
                                                    </Combobox.Item>
                                                ))}
                                            </Combobox.ItemGroup>
                                        </Combobox.Content>
                                    </Combobox.Positioner>
                                </Combobox.Root>
                            </Stack>
                        </Stack>
                    </Stack>
                </Card.Body>
                <Card.Footer>
                    <Stack direction={"row"} alignItems={"center"} gap={"16px"} mr={"auto"}>
                        <Box
                            border={"1px solid"}
                            borderColor={"border"}
                            borderRadius={"8px"}
                            px={"8px"}
                        >
                            {currentPoints}pt
                        </Box>
                        <Box>
                            合計:{" "}
                            <span
                                className={css({
                                    fontWeight: "bold",
                                    fontSize: "2xl",
                                })}
                            >
                                {currentPoints * currentSendUsers.length}pt
                            </span>
                        </Box>
                    </Stack>
                    <Button type="submit" variant="outline">
                        <Icon color="blush">
                            <SendHorizontal />
                        </Icon>
                        投稿する
                    </Button>
                </Card.Footer>
            </Card.Root>
        </form>
    );
};
