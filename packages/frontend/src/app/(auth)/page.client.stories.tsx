import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { mockAppreciationList } from "~/mock/appreciation/appreciation";
import { mockUserInfo, mockUsers } from "~/mock/user/user";
import { ClientTopPage } from "./page.client";

const meta: Meta<typeof ClientTopPage> = {
	component: ClientTopPage,
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj<typeof ClientTopPage>;

export const Default: Story = {
	args: {
		userInfo: mockUserInfo,
		appreciationList: mockAppreciationList,
		allUsers: mockUsers,
		receivedPointRanking: [
			{
				userID: "user1",
				discordUserName: "user1",
				discordAvatar: "https://example.com/avatar1.jpg",
				totalPoints: 1500,
			},
		],
		sendPointRanking: [
			{
				userID: "user1",
				discordUserName: "user1",
				discordAvatar: "https://example.com/avatar1.jpg",
				totalPoints: 1500,
			},
		],
	},
};
