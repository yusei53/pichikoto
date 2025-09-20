import type { Post } from "@/model/post";
import { mockUser } from "../user";

export const mockPost: Post = {
  id: "1",
  points: 13,
  message:
    "aaaaaすごくいいと思います本当にとてもいいまじでいいめっちゃいいうんうんうんあああああa\n" +
    "aaaaaすごくいいと思います本当にとてもいいまじでいいめっちゃいいうんうんうんあああああa\n" +
    "aaaaaすごくいいと思います本当にとてもいいまじでいいめっちゃいいうんうんうんあああああa\n" +
    "aaaaaすごくいいと思います本当にとてもいいまじでいいめっちゃいいうんうんうんあああああa\n" +
    "aaaaaすごくいいと思います本当にとてもいいまじでいいめっちゃいいうんうんうんあああああa",
  createdAt: new Date("2025-08-19T00:00:00.000Z"),
  sendUser: mockUser,
  receivedUsers: [mockUser, mockUser],
  handsClapping: 10
};
