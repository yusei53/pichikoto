import { Box, Divider } from "styled-system/jsx";

import { Stack } from "styled-system/jsx";
import { Input } from "~/components/ui/input";

type AppreciationListHeaderProps = {
	children: React.ReactNode;
	onSearchChange: (value: string) => void;
};

export const AppreciationListHeader: React.FC<AppreciationListHeaderProps> = ({
	onSearchChange,
	children,
}) => {
	return (
		<Stack direction={"column"} gap={"8px"}>
			<Stack direction={"row"} alignItems={"center"} gap={"16px"}>
				{children}
				<Box ml={"auto"}>
					<Input
						placeholder="検索"
						onChange={(e) => onSearchChange(e.target.value)}
					/>
				</Box>
			</Stack>
			<Divider />
		</Stack>
	);
};
