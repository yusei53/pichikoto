import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Box } from "styled-system/jsx";
import { AppreciationListHeader } from "./AppreciationListHeader";

const meta: Meta<typeof AppreciationListHeader> = {
	component: AppreciationListHeader,
};

export default meta;
type Story = StoryObj<typeof AppreciationListHeader>;

export const Default: Story = {
	args: {
		children: <Box fontSize={"md"}>みんなのmomopos</Box>,
	},
};
{
}
