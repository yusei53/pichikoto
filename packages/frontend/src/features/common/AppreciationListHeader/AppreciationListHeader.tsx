import { Divider } from "styled-system/jsx";

import { Stack } from "styled-system/jsx";

type AppreciationListHeaderProps = {
	children: React.ReactNode;
};

export const AppreciationListHeader: React.FC<AppreciationListHeaderProps> = ({
	children,
}) => {
	return (
		<Stack direction={"column"} gap={"8px"}>
			<Stack direction={"row"} alignItems={"center"} gap={"16px"}>
				{children}
				{/* TODO: 検索機能を追加 */}
			</Stack>
			<Divider />
		</Stack>
	);
};
