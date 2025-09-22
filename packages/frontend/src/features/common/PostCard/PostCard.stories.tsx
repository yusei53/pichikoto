import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { mockPosts } from "~/mock/post";
import { mockUser } from "~/mock/user";
import { PostCard } from "./PostCard";

const meta: Meta<typeof PostCard> = {
	component: PostCard,
};

export default meta;
type Story = StoryObj<typeof PostCard>;

export const Default: Story = {
	args: {
		post: mockPosts[0],
	},
};

export const WithFiveReceivedUsers: Story = {
	args: {
		post: {
			...mockPosts[0],
			receivedUsers: [mockUser, mockUser, mockUser, mockUser, mockUser],
		},
	},
};
