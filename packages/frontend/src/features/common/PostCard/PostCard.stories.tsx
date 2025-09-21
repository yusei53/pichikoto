import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { mockPost } from "~/mock/post";
import { mockUser } from "~/mock/user";
import { PostCard } from "./PostCard";

const meta: Meta<typeof PostCard> = {
    component: PostCard,
};

export default meta;
type Story = StoryObj<typeof PostCard>;

export const Default: Story = {
    args: {
        post: mockPost,
    },
};

export const WithFiveReceivedUsers: Story = {
    args: {
        post: {
            ...mockPost,
            receivedUsers: [mockUser, mockUser, mockUser, mockUser, mockUser],
        },
    },
};
