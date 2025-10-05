import { Box, Stack } from "styled-system/jsx";
import { Tabs } from "~/components/ui/tabs";

type TabsProps = Tabs.RootProps & {
	options: {
		id: string;
		label: string;
		icon: React.ReactNode | undefined;
	}[];
};

export const AppTabs: React.FC<TabsProps> = (props) => {
	const { options } = props;
	return (
		<Tabs.Root {...props} variant="enclosed" width={"fit-content"}>
			<Tabs.List>
				{options.map((option) => (
					<Tabs.Trigger key={option.id} value={option.id}>
						<Stack direction={"row"} gap={"4px"} alignItems={"center"}>
							<Box>{option.icon}</Box>
							<Box>{option.label}</Box>
						</Stack>
					</Tabs.Trigger>
				))}
				<Tabs.Indicator />
			</Tabs.List>
		</Tabs.Root>
	);
};
