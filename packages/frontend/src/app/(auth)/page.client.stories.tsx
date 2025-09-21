import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { mockPointRankings } from "~/mock/point-ranking/point-ranking";
import { mockPosts } from "~/mock/post";
import { mockUser } from "~/mock/user";
import { ClientTopPage } from "./page.client";

const meta: Meta<typeof ClientTopPage> = {
    component: ClientTopPage,
};

export default meta;
type Story = StoryObj<typeof ClientTopPage>;

export const Default: Story = {
    args: {
        user: mockUser,
        posts: mockPosts,
        receivedPointRanking: mockPointRankings,
        sendPointRanking: mockPointRankings,
    },
};
