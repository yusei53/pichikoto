import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { mockPointRankings } from "~/mock/point-ranking/point-ranking";
import { mockPosts } from "~/mock/post";
import { mockUser } from "~/mock/user";
import { mockUsers } from "~/mock/user/user";
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
		user: mockUser,
		posts: mockPosts,
		remainingPoints: 100,
		allUsers: mockUsers,
		receivedPointRanking: mockPointRankings,
		sendPointRanking: mockPointRankings,
	},
};
