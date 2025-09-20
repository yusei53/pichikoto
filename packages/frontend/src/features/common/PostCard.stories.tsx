import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { mockPost } from "~/mock/post";
import { mockUser } from "~/mock/user";
import { PostCard } from "./PostCard";

const meta: Meta<typeof PostCard> = {
  component: PostCard
};

export default meta;
type Story = StoryObj<typeof PostCard>;

export const Default: Story = {
  args: {
    post: mockPost
  }
};

export const WithLongMessage: Story = {
  args: {
    post: {
      ...mockPost,
      message:
        "これは非常に長いメッセージです。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。これは非常に長いメッセージです。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。長いメッセージが表示される場合のテスト用です。"
    }
  }
};

export const WithVeryLongUsername: Story = {
  args: {
    post: {
      ...mockPost,
      sendUser: {
        ...mockPost.sendUser,
        discordUserName: "very-very-long-username-32-chars"
      },
      receivedUsers: [
        {
          ...mockPost.sendUser,
          discordUserName: "very-very-long-username-32-chars"
        },
        {
          ...mockPost.sendUser,
          discordUserName: "very-very-long-username-32-chars"
        }
      ]
    }
  }
};

export const WithLongDiscordID: Story = {
  args: {
    post: {
      ...mockPost,
      sendUser: {
        ...mockPost.sendUser,
        discordID: "1234567890abcdefghijklmnopqrstuv"
      }
    }
  }
};

export const WithShortMessage: Story = {
  args: {
    post: {
      ...mockPost,
      message: "これは非常に短いです"
    }
  }
};

export const WithThreeReceivedUsers: Story = {
  args: {
    post: {
      ...mockPost,
      receivedUsers: [mockUser, mockUser, mockUser]
    }
  }
};

export const WithFourReceivedUsers: Story = {
  args: {
    post: {
      ...mockPost,
      receivedUsers: [mockUser, mockUser, mockUser, mockUser]
    }
  }
};

export const WithFiveReceivedUsers: Story = {
  args: {
    post: {
      ...mockPost,
      receivedUsers: [mockUser, mockUser, mockUser, mockUser, mockUser]
    }
  }
};

export const WithHighPoints: Story = {
  args: {
    post: {
      ...mockPost,
      receivedUsers: [mockUser, mockUser, mockUser, mockUser, mockUser],
      points: 120
    }
  }
};

export const WithManyHandsClapping: Story = {
  args: {
    post: {
      ...mockPost,
      handsClapping: 1000
    }
  }
};
