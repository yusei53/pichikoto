import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { UserPageHeader } from "./UserPageHeader";

const meta: Meta<typeof UserPageHeader> = {
	component: UserPageHeader,
};

export default meta;
type Story = StoryObj<typeof UserPageHeader>;

export const Default: Story = {
	args: {
		username: "test-user-name",
		name: "テストユーザー",
		image: "https://github.com/shadcn.png",
	},
};

export const WithLongName: Story = {
	args: {
		username: "very-long-username-that-might-overflow",
		name: "非常に長いユーザー名が表示される場合のテスト",
		image: "https://github.com/shadcn.png",
	},
};

export const WithoutImage: Story = {
	args: {
		username: "no-image-user",
		name: "画像なしユーザー",
		image: "",
	},
};
