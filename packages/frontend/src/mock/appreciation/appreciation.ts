import type { Appreciation } from "~/model/appreciation";
import { mockUser } from "../user";
import { mockUsers } from "../user/user";

export const mockAppreciationList: Appreciation[] = [
	{
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
		receivedUsers: mockUsers,
		handsClapping: 10,
	},
	{
		id: "2",
		points: 13,
		message:
			"aaaaaすごくいいと思います本当にとてもいいまじでいいめっちゃいいうんうんうんあああああa",
		createdAt: new Date("2025-08-19T00:00:00.000Z"),
		sendUser: mockUser,
		receivedUsers: mockUsers,
		handsClapping: 10,
	},
	{
		id: "3",
		points: 13,
		message:
			"aaaaaすごくいいと思います本当にとてもいいまじでいいめっちゃいいうんうんうんあああああa",
		createdAt: new Date("2025-08-19T00:00:00.000Z"),
		sendUser: mockUser,
		receivedUsers: mockUsers,
		handsClapping: 10,
	},
	{
		id: "4",
		points: 13,
		message:
			"aaaaaすごくいいと思います本当にとてもいいまじでいいめっちゃいいうんうんうんあああああa",
		createdAt: new Date("2025-08-19T00:00:00.000Z"),
		sendUser: mockUser,
		receivedUsers: mockUsers,
		handsClapping: 10,
	},
	{
		id: "5",
		points: 13,
		message:
			"aaaaaすごくいいと思います本当にとてもいいまじでいいめっちゃいいうんうんうんあああああa",
		createdAt: new Date("2025-08-19T00:00:00.000Z"),
		sendUser: mockUser,
		receivedUsers: mockUsers,
		handsClapping: 10,
	},
];
