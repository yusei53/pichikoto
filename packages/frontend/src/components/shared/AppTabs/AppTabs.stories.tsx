import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GiftIcon, SendHorizontal } from "lucide-react";
import { Icon } from "~/components/ui/icon";
import { AppTabs } from "./AppTabs";

const meta: Meta<typeof AppTabs> = {
	component: AppTabs,
};

export default meta;
type Story = StoryObj<typeof AppTabs>;

export const Default: Story = {
	args: {
		options: [
			{
				id: "post",
				label: "momoposを作成",
				icon: (
					<Icon color={"blush"}>
						<SendHorizontal />
					</Icon>
				),
			},
			{
				id: "profile",
				label: "プロフィールを表示",
				icon: (
					<Icon color={"sage"}>
						<GiftIcon />
					</Icon>
				),
			},
		],
		defaultValue: "post",
	},
};
