import { formatDate } from "@/app/user-page/page.client";
import { mockPost } from "@/mock/post";
import { mockUser } from "@/mock/user";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PostCard } from "./PostCard";

const meta: Meta<typeof PostCard> = {
  component: PostCard
};

export default meta;
type Story = StoryObj<typeof PostCard>;

export const Default: Story = {
  args: {
    post: mockPost,
    formatDate: formatDate
  }
};

export const WithLongMessage: Story = {
  args: {
    post: {
      ...mockPost,
      message:
        "これは非常に長いメッセージです。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。これは非常に長いメッセージです。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。"
    },
    formatDate: formatDate
  }
};

export const WithVeryLongUsername: Story = {
  args: {
    post: {
      ...mockPost,
      sendUser: {
        ...mockPost.sendUser,
        discordUserName:
          "これは非常に長いユーザーネームです。Discordでは実際にこんなに長いユーザーネームが設定されることがあります。長いユーザーネームが表示される場合のテスト用です。長いユーザーネームが表示される場合のテスト用です。長いユーザーネームが表示される場合のテスト用です。"
      },
      receivedUsers: [
        {
          ...mockPost.sendUser,
          discordUserName:
            "受信者1も非常に長いユーザーネームです。長いユーザーネームが表示される場合のテスト用です。長いユーザーネームが表示される場合のテスト用です。長いユーザーネームが表示される場合のテスト用です。"
        },
        {
          ...mockPost.sendUser,
          discordUserName:
            "受信者2も非常に長いユーザーネームです。長いユーザーネームが表示される場合のテスト用です。長いユーザーネームが表示される場合のテスト用です。長いユーザーネームが表示される場合のテスト用です。"
        }
      ]
    },
    formatDate: formatDate
  }
};

export const WithLongDiscordID: Story = {
  args: {
    post: {
      ...mockPost,
      sendUser: {
        ...mockPost.sendUser,
        discordID:
          "this-is-a-very-long-discord-id-that-might-cause-layout-issues-when-displayed-in-the-ui-component"
      }
    },
    formatDate: formatDate
  }
};

export const WithShortMessage: Story = {
  args: {
    post: {
      ...mockPost,
      message: "これは非常に短いです"
    },
    formatDate: formatDate
  }
};

export const WithThreeReceivedUsers: Story = {
  args: {
    post: {
      ...mockPost,
      receivedUsers: [mockUser, mockUser, mockUser]
    },
    formatDate: formatDate
  }
};

export const WithFourReceivedUsers: Story = {
  args: {
    post: {
      ...mockPost,
      receivedUsers: [mockUser, mockUser, mockUser, mockUser]
    },
    formatDate: formatDate
  }
};

export const WithFiveReceivedUsers: Story = {
  args: {
    post: {
      ...mockPost,
      receivedUsers: [mockUser, mockUser, mockUser, mockUser, mockUser]
    },
    formatDate: formatDate
  }
};

export const WithHighPoints: Story = {
  args: {
    post: {
      ...mockPost,
      receivedUsers: [mockUser, mockUser, mockUser, mockUser, mockUser],
      points: 120
    },
    formatDate: formatDate
  }
};

export const WithManyHandsClapping: Story = {
  args: {
    post: {
      ...mockPost,
      handsClapping: 1000
    },
    formatDate: formatDate
  }
};
