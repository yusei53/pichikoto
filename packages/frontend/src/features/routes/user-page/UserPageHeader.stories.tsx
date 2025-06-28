import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { UserPageHeader } from "./UserPageHeader";

const meta: Meta<typeof UserPageHeader> = {
  title: "Features/UserPage/UserPageHeader",
  component: UserPageHeader,
  parameters: {
    layout: "padded"
  },
  tags: ["dev"],
  argTypes: {
    username: {
      control: "text",
      description: "ユーザーのユーザー名"
    },
    name: {
      control: "text",
      description: "ユーザーの表示名"
    },
    image: {
      control: "text",
      description: "ユーザーのアバター画像URL"
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    username: "test-user-name",
    name: "テストユーザー",
    image: "https://github.com/shadcn.png"
  }
};

export const WithLongName: Story = {
  args: {
    username: "very-long-username-that-might-overflow",
    name: "非常に長いユーザー名が表示される場合のテスト",
    image: "https://github.com/shadcn.png"
  }
};

export const WithoutImage: Story = {
  args: {
    username: "no-image-user",
    name: "画像なしユーザー",
    image: ""
  }
};

export const FallbackAvatar: Story = {
  args: {
    username: "fallback-user",
    name: "フォールバックユーザー",
    image: "https://invalid-url-that-will-fail.com/image.png"
  }
};

export const JapaneseUser: Story = {
  args: {
    username: "yamada-taro",
    name: "山田太郎",
    image: "https://github.com/shadcn.png"
  }
};
