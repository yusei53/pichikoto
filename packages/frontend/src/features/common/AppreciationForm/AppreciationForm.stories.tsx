import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { mockUsers } from "~/mock/user/user";
import { AppreciationForm } from "./AppreciationForm";

const meta: Meta<typeof AppreciationForm> = {
	component: AppreciationForm,
};

export default meta;
type Story = StoryObj<typeof AppreciationForm>;

export const Default: Story = {
	args: {
		users: mockUsers,
		remainingPoints: 100,
	},
};
