import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PostListHeader } from "./PostListHeader";

const meta: Meta<typeof PostListHeader> = {
    component: PostListHeader,
};

export default meta;
type Story = StoryObj<typeof PostListHeader>;

export const Default: Story = {};
