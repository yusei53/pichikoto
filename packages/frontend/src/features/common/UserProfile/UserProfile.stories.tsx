import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { UserProfile } from "./UserProfile";

const meta: Meta<typeof UserProfile> = {
    component: UserProfile,
};

export default meta;
type Story = StoryObj<typeof UserProfile>;

export const Default: Story = {
    args: {
        userID: "test.id",
        userName: "テストユーザー#1234",
        avatarUrl: "https://example.com/avatar.jpg",
        isNotificationEnabled: false,
    },
};

export const WithNotification: Story = {
    args: {
        userID: "test.id",
        userName: "テストユーザー#1234",
        isNotificationEnabled: true,
        avatarUrl: "https://example.com/avatar.jpg",
    },
};
