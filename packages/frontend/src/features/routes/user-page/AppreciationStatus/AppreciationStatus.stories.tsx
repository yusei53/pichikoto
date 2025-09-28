import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AppreciationStatus } from "./AppreciationStatus";

const meta: Meta<typeof AppreciationStatus> = {
	component: AppreciationStatus,
};

export default meta;
type Story = StoryObj<typeof AppreciationStatus>;

export const Default: Story = {
	args: {
		title: "今月",
		sendPoint: 100,
		receivedPoint: 200,
	},
};
