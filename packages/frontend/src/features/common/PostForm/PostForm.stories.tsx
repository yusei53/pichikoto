import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { mockUsers } from "~/mock/user/user";
import { PostForm } from "./PostForm";

const meta: Meta<typeof PostForm> = {
	component: PostForm,
};

export default meta;
type Story = StoryObj<typeof PostForm>;

export const Default: Story = {
	args: {
		users: mockUsers,
		remainingPoints: 100,
	},
};
