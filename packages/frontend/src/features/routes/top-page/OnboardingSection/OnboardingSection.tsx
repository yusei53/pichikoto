import { HandHeart } from "lucide-react";
import { Box, Stack } from "styled-system/jsx";
import { Icon } from "~/components/ui/icon";

export const OnboardingSection: React.FC = () => {
	return (
		<Box
			bg={"bg.subtle"}
			borderRadius={"lg"}
			p={"16px"}
			border={"1px solid"}
			borderColor={"border.subtle"}
		>
			<Stack direction={"row"} alignItems={"center"} gap={"12px"}>
				<Icon color={"accent"} size={"lg"}>
					<HandHeart />
				</Icon>
				<Stack direction={"column"} gap={"2px"}>
					<Box fontWeight={"semibold"} fontSize={"sm"}>
						今日も感謝を伝えよう
					</Box>
					<Box fontSize={"sm"} color={"fg.muted"}>
						メンバーに感謝の気持ちとポイントを送ることができます
					</Box>
				</Stack>
			</Stack>
		</Box>
	);
};
