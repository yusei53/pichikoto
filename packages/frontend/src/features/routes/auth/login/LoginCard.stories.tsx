import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LoginCard } from "./LoginCard";

const meta: Meta<typeof LoginCard> = {
	component: LoginCard,
};

export default meta;
type Story = StoryObj<typeof LoginCard>;

export const Default: Story = {};
