import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { mockAppreciationList } from "~/mock/appreciation/appreciation";
import { mockUserInfo, mockUsers } from "~/mock/user/user";
import { UserPageClient } from "./page.client";

const meta: Meta<typeof UserPageClient> = {
	component: UserPageClient,
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj<typeof UserPageClient>;

export const Default: Story = {
	args: {
		user: mockUserInfo,
		appreciationList: mockAppreciationList,
		allUsers: mockUsers,
		sendUserList: [],
		receivedUserList: [],
	},
};
