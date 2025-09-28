import { Box, Divider } from "styled-system/jsx";

import { Stack } from "styled-system/jsx";
import { Input } from "~/components/ui/input";

type AppreciationListHeaderProps = {
	onSearchChange: (value: string) => void;
};

export const AppreciationListHeader: React.FC<AppreciationListHeaderProps> = ({
	onSearchChange,
}) => {
	return (
		<Stack direction={"column"} gap={"8px"}>
			<Stack direction={"row"} alignItems={"center"} gap={"16px"}>
				<Box fontSize={"md"}>みんなのmomopos</Box>
				<Box ml={"auto"}>
					<Input placeholder="検索" onChange={(e) => onSearchChange(e.target.value)} />
				</Box>
			</Stack>
			<Divider />
		</Stack>
	);
};
