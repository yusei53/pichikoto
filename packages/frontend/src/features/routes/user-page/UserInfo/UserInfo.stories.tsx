import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { mockUser } from "~/mock/user/user";
import { UserInfo } from "./UserInfo";

const meta: Meta<typeof UserInfo> = {
	component: UserInfo,
};

export default meta;
type Story = StoryObj<typeof UserInfo>;

export const Default: Story = {
	args: {
		user: mockUser,
	},
};
