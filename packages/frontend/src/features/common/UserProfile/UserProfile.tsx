import { BellRingIcon } from "lucide-react";
import { Box, Divider, Stack } from "styled-system/jsx";
import { Avatar } from "~/components/ui/avatar";
import { Icon } from "~/components/ui/icon";

type UserProfileProps = {
	globalName: string | null;
	userName: string;
	avatarUrl: string;
	isNotificationEnabled: boolean;
};

export const UserProfile: React.FC<UserProfileProps> = ({
	globalName,
	userName,
	avatarUrl,
	isNotificationEnabled,
}) => {
	return (
		<Stack direction={"column"} gap={"16px"}>
			<Stack alignItems={"center"} direction={"row"} gap={"24px"}>
				<Box>
					<Avatar size={"2xl"} src={avatarUrl} />
				</Box>
				<Box>
					<Stack direction={"column"} gap={"4px"}>
						{globalName !== null ? (
							<>
								<Box fontWeight={"bold"}>{globalName}</Box>
								<Box fontSize={"md"}>{userName}</Box>
							</>
						) : (
							<Box fontWeight={"bold"}>{userName}</Box>
						)}
					</Stack>
				</Box>
				{isNotificationEnabled && (
					<Stack alignItems={"center"} justifyContent={"center"} gap={"0"}>
						<Box>new!!</Box>
						<Icon size={"lg"}>
							<BellRingIcon />
						</Icon>
					</Stack>
				)}
			</Stack>

			<Divider />
		</Stack>
	);
};
