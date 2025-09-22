import z from "zod";

const postSchema = z.object({
	sendUserID: z.array(z.string()).min(1, { message: "送る人を選択してください" }),
	message: z
		.string()
		.min(1, { message: "メッセージを入力してください" })
		.max(1000, { message: "メッセージは1000文字以内にしてください" }),
	points: z.number().min(1, { message: "ポイントを選択してください" }),
});

export const createPostSchema = (remainingPoints: number) => {
	return postSchema
		.refine((data) => data.points * data.sendUserID.length <= 40, {
			message: "送ることができるのは合計40ptまでです",
			path: ["points"],
		})
		.refine((data) => data.points * data.sendUserID.length <= remainingPoints, {
			message: "残ポイントが不足しています",
			path: ["points"],
		});
};

export type PostFormValues = z.infer<typeof postSchema>;
