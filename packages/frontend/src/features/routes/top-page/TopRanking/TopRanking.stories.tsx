import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SendHorizontal } from "lucide-react";
import { Icon } from "~/components/ui/icon";
import { TopRanking } from "./TopRanking";

const meta: Meta<typeof TopRanking> = {
    component: TopRanking,
};

export default meta;
type Story = StoryObj<typeof TopRanking>;

export const Default: Story = {
    args: {
        title: "今週送ったランキング",
        titleIcon: (
            <Icon color={"sage"}>
                <SendHorizontal />
            </Icon>
        ),
        rankingUsers: [
            {
                userID: "user1",
                avatarUrl: "https://example.com/avatar1.jpg",
                point: 1500,
            },
            {
                userID: "user2",
                avatarUrl: "https://example.com/avatar1.jpg",
                point: 1200,
            },
            {
                userID: "user3",
                avatarUrl: "https://example.com/avatar1.jpg",
                point: 1000,
            },
        ],
    },
};
