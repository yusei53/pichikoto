import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PointSet } from "./PointSet";

const meta: Meta<typeof PointSet> = {
  component: PointSet
};

export default meta;
type Story = StoryObj<typeof PointSet>;

export const Default: Story = {
  args: {
    remainPoint: 100
  }
};

export const WithLongRemainPoint: Story = {
  args: {
    remainPoint: 10000
  }
};

export const WithZeroPoint: Story = {
  args: {
    remainPoint: 0
  }
};
