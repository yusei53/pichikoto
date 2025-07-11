import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PointLog } from "./PointLog";

const meta: Meta<typeof PointLog> = {
  component: PointLog
};

export default meta;
type Story = StoryObj<typeof PointLog>;

export const Default: Story = {
  args: {
    sendPoint: 100,
    receivedPoint: 200
  }
};

export const WithLongReceivedPoint: Story = {
  args: {
    sendPoint: 100,
    receivedPoint: 10000
  }
};

export const WithZeroPoint: Story = {
  args: {
    sendPoint: 0,
    receivedPoint: 0
  }
};
