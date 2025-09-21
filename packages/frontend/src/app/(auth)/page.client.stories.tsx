import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { mockPointRanking } from "~/mock/point-ranking/point-ranking";
import { mockPost } from "~/mock/post";
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
        posts: [mockPost, mockPost, mockPost],
        receivedPointRanking: [mockPointRanking, mockPointRanking, mockPointRanking],
        sendPointRanking: [mockPointRanking, mockPointRanking, mockPointRanking],
    },
};
