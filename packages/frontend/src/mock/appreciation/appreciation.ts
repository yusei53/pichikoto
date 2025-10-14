import type { Appreciation } from "~/model/appreciation";
import { mockUser } from "../user";
import { mockUsers } from "../user/user";

export const mockAppreciationList: Appreciation[] = [
	{
		id: "1",
		pointPerReceiver: 13,
		message:
			"aaaaaすごくいいと思います本当にとてもいいまじでいいめっちゃいいうんうんうんあああああa\n" +
			"aaaaaすごくいいと思います本当にとてもいいまじでいいめっちゃいいうんうんうんあああああa\n" +
			"aaaaaすごくいいと思います本当にとてもいいまじでいいめっちゃいいうんうんうんあああああa\n" +
			"aaaaaすごくいいと思います本当にとてもいいまじでいいめっちゃいいうんうんうんあああああa\n" +
			"aaaaaすごくいいと思います本当にとてもいいまじでいいめっちゃいいうんうんうんあああああa",
		createdAt: new Date("2025-08-19T00:00:00.000Z"),
		sender: mockUser,
		receivers: mockUsers,
	},
	{
		id: "2",
		pointPerReceiver: 13,
		message:
			"aaaaaすごくいいと思います本当にとてもいいまじでいいめっちゃいいうんうんうんあああああa",
		createdAt: new Date("2025-08-19T00:00:00.000Z"),
		sender: mockUser,
		receivers: mockUsers,
	},
	{
		id: "3",
		pointPerReceiver: 13,
		message:
			"aaaaaすごくいいと思います本当にとてもいいまじでいいめっちゃいいうんうんうんあああああa",
		createdAt: new Date("2025-08-19T00:00:00.000Z"),
		sender: mockUser,
		receivers: mockUsers,
	},
	{
		id: "4",
		pointPerReceiver: 13,
		message:
			"aaaaaすごくいいと思います本当にとてもいいまじでいいめっちゃいいうんうんうんあああああa",
		createdAt: new Date("2025-08-19T00:00:00.000Z"),
		sender: mockUser,
		receivers: mockUsers,
	},
	{
		id: "5",
		pointPerReceiver: 13,
		message:
			"aaaaaすごくいいと思います本当にとてもいいまじでいいめっちゃいいうんうんうんあああああa",
		createdAt: new Date("2025-08-19T00:00:00.000Z"),
		sender: mockUser,
		receivers: mockUsers,
	},
];
