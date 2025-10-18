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
import { useAppreciationForm } from "./usePostForm";

type AppreciationFormProps = {
	users: User[];
	remainingPoints: number;
};

export const AppreciationForm: React.FC<AppreciationFormProps> = ({
	users,
	remainingPoints,
}) => {
	const {
		register,
		onSubmit,
		onSendUserChange,
		onPointsChange,
		errors,
		usersCollection,
		pointsCollection,
		currentReceiverUsers,
		currentPoints,
	} = useAppreciationForm({ users, remainingPoints });

	return (
		<form onSubmit={onSubmit}>
			<Card.Root
				className={css({
					boxShadow:
						"rgba(0, 0, 0, 0.05) 0px 2px 4px, rgba(0, 0, 0, 0.03) 0px 1px 1px",
					border: "1px solid",
					borderColor: "border",
					pt: "24px",
				})}
			>
				<Card.Body>
					<Stack direction={"column"} gap={"16px"}>
						<Combobox.Root
							multiple
							collection={usersCollection}
							onValueChange={onSendUserChange}
						>
							<Field.Root invalid={!!errors.receiverIDs}>
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
								<Field.ErrorText>{errors.receiverIDs?.message}</Field.ErrorText>
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
													<Combobox.ItemText>{item.label}</Combobox.ItemText>
													<Combobox.ItemIndicator>
														<CheckIcon />
													</Combobox.ItemIndicator>
												</Stack>
											</Combobox.Item>
										))}
									</Combobox.ItemGroup>
								</Combobox.Content>
							</Combobox.Positioner>
						</Combobox.Root>
						<Stack direction={"row"} alignItems={"center"} gap={"16px"}>
							{currentReceiverUsers.map((user) => (
								<Stack
									direction={"column"}
									alignItems={"center"}
									gap={"4px"}
									key={user.discordUserID}
								>
									<Avatar size={"md"} src={user.discordAvatar} />
									<Box
										maxWidth="60px"
										overflow="hidden"
										textOverflow="ellipsis"
										whiteSpace="nowrap"
										fontSize="sm"
									>
										{user.discordGlobalName ?? user.discordUserName}
									</Box>
								</Stack>
							))}
						</Stack>
						<Divider />
						<Field.Root invalid={!!errors.message}>
							<Field.Label fontSize={"sm"} fontWeight={"semibold"}>
								感謝のメッセージ
							</Field.Label>
							<Field.Input asChild>
								<Textarea
									minH={"175px"}
									{...register("message")}
									placeholder="具体的なエピソードがあるとより伝わります✨"
								/>
							</Field.Input>
							<Field.ErrorText>{errors.message?.message}</Field.ErrorText>
						</Field.Root>
						<Divider />
						<Stack direction={"column"} gap={"8px"}>
							<Stack direction={"column"} gap={"4px"}>
								<Stack direction={"row"} alignItems={"center"} gap={"16px"}>
									<Box fontWeight={"semibold"} fontSize={"sm"}>
										今週残ポイント
									</Box>
									<Box ml={"auto"} fontWeight={"semibold"} fontSize={"lg"}>
										{remainingPoints}pt
									</Box>
								</Stack>
								<Divider mb={"8px"} />
								<Combobox.Root
									collection={pointsCollection}
									onValueChange={onPointsChange}
								>
									<Field.Root invalid={!!errors.pointPerReceiver}>
										<Field.Label fontSize={"sm"} fontWeight={"semibold"}>
											送るポイント（1人あたり）
										</Field.Label>
										<Combobox.Control>
											<Field.Input asChild>
												<Combobox.Input
													placeholder="ポイントを選択してください"
													asChild
												>
													<Input />
												</Combobox.Input>
											</Field.Input>
											<Combobox.Trigger asChild>
												<IconButton variant="link" aria-label="open" size="xs">
													<ChevronsUpDownIcon />
												</IconButton>
											</Combobox.Trigger>
										</Combobox.Control>
										<Field.ErrorText>
											{errors.pointPerReceiver?.message}
										</Field.ErrorText>
									</Field.Root>
									<Combobox.Positioner>
										<Combobox.Content>
											<Combobox.ItemGroup>
												{pointsCollection.items.map((item) => (
													<Combobox.Item key={item.value} item={item}>
														<Combobox.ItemText>{item.label}</Combobox.ItemText>
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
					<Stack
						direction={"row"}
						alignItems={"center"}
						justifyContent={"space-between"}
						width={"100%"}
					>
						<Box>
							<Stack direction={"row"} alignItems={"center"} gap={"8px"}>
								<Box fontSize={"sm"} color={"fg.muted"}>
									合計:
								</Box>
								<Box fontWeight={"bold"} fontSize={"2xl"} color={"accent.fg"}>
									{currentPoints * currentReceiverUsers.length}pt
								</Box>
							</Stack>
						</Box>
						<Button
							type="submit"
							variant="outline"
							size={"lg"}
							disabled={
								currentReceiverUsers.length === 0 || currentPoints === 0
							}
						>
							<Icon color="blush">
								<SendHorizontal />
							</Icon>
							感謝を送る
						</Button>
					</Stack>
				</Card.Footer>
			</Card.Root>
		</form>
	);
};
