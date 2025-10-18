import z from "zod";

const appreciationSchema = z.object({
	receiverIDs: z
		.array(z.string())
		.min(1, { message: "送る人を選択してください" }),
	message: z
		.string()
		.min(1, { message: "メッセージを入力してください" })
		.max(250, { message: "メッセージは250文字以内にしてください" }),
	pointPerReceiver: z
		.number()
		.min(1, { message: "ポイントを選択してください" }),
});

export const createAppreciationSchema = (remainingPoints: number) => {
	return appreciationSchema
		.refine((data) => data.pointPerReceiver * data.receiverIDs.length <= 40, {
			message: "送ることができるのは合計40ptまでです",
			path: ["points"],
		})
		.refine(
			(data) =>
				data.pointPerReceiver * data.receiverIDs.length <= remainingPoints,
			{
				message: "残ポイントが不足しています",
				path: ["points"],
			}
		);
};

export type AppreciationValues = z.infer<typeof appreciationSchema>;
