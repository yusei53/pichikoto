import type { PointRanking } from "~/model/point-ranking";

export const mockPointRanking: PointRanking = {
    userID: "user1",
    point: 100,
    avatarUrl: "https://github.com/shadcn.png",
};

export const mockPointRankings: PointRanking[] = [
    {
        userID: "user1",
        point: 100,
        avatarUrl: "https://github.com/shadcn.png",
    },
    {
        userID: "user2",
        point: 100,
        avatarUrl: "https://github.com/shadcn.png",
    },
    {
        userID: "user3",
        point: 100,
        avatarUrl: "https://github.com/shadcn.png",
    },
];
