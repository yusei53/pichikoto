import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { mockUser, mockUsers } from "~/mock/user/user";
import { AppreciationLog } from "./AppreciationLog";

const meta: Meta<typeof AppreciationLog> = {
	component: AppreciationLog,
};

export default meta;
type Story = StoryObj<typeof AppreciationLog>;

export const Default: Story = {
	args: {
		targetUsr: mockUser,
		sendUserList: mockUsers,
		receivedUserList: [
			...mockUsers,
			{ ...mockUser, discordUserID: "4" },
			{ ...mockUser, discordUserID: "5" },
		],
	},
};

export const Empty: Story = {
	args: {
		targetUsr: mockUser,
		sendUserList: [],
		receivedUserList: [],
	},
};
