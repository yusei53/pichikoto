import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AppreciationListHeader } from "./AppreciationListHeader";

const meta: Meta<typeof AppreciationListHeader> = {
	component: AppreciationListHeader,
};

export default meta;
type Story = StoryObj<typeof AppreciationListHeader>;

export const Default: Story = {};
