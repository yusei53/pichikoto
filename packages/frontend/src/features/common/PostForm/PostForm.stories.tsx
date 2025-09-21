import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PostForm } from "./PostForm";

const meta: Meta<typeof PostForm> = {
    component: PostForm,
};

export default meta;
type Story = StoryObj<typeof PostForm>;

export const Default: Story = {};
