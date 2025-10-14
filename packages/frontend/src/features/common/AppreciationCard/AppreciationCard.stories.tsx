import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { mockAppreciationList } from "~/mock/appreciation/appreciation";
import { mockUser } from "~/mock/user";
import { AppreciationCard } from "./AppreciationCard";

const meta: Meta<typeof AppreciationCard> = {
	component: AppreciationCard,
};

export default meta;
type Story = StoryObj<typeof AppreciationCard>;

export const Default: Story = {
	args: {
		appreciation: mockAppreciationList[0],
	},
};

export const WithFiveReceivedUsers: Story = {
	args: {
		appreciation: {
			...mockAppreciationList[0],
			receivers: [mockUser, mockUser, mockUser, mockUser, mockUser],
		},
	},
};
