import { createListCollection } from "@ark-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toaster } from "~/components/shared/AppToaster/AppToaster";
import type { ValueChangeDetails } from "~/components/ui/styled/combobox";
import type { User } from "~/model/user";
import { createAppreciationAction } from "./actions/createAppreciationAction";
import type { AppreciationValues } from "./endpoints/appreciationSchema";
import { createAppreciationSchema } from "./endpoints/appreciationSchema";

type UseAppreciationFormProps = {
	users: User[];
	remainingPoints: number;
};
const initialPoints = [5, 10, 15, 20, 30, 40] as const;

export const useAppreciationForm = ({
	users,
	remainingPoints,
}: UseAppreciationFormProps) => {
	const postSchema = useMemo(
		() => createAppreciationSchema(remainingPoints),
		[remainingPoints]
	);
	const {
		setValue,
		register,
		handleSubmit,
		watch,
		trigger,
		reset,
		formState: { isValid, errors },
	} = useForm<AppreciationValues>({
		resolver: zodResolver(postSchema),
		mode: "onChange",
		defaultValues: {
			receiverIDs: [],
			message: "",
			pointPerReceiver: 0,
		},
	});

	const receiverIDs = watch("receiverIDs");
	const currentPoints = watch("pointPerReceiver");

	const usersCollection = useMemo(() => {
		return createListCollection({
			items: users.map((user) => ({
				value: user.discordUserID,
				label: user.discordGlobalName ?? user.discordUserName,
				avatarUrl: user.discordAvatar,
			})),
		});
	}, [users]);

	const currentReceiverUsers = useMemo(() => {
		return users.filter((user) => receiverIDs.includes(user.discordUserID));
	}, [receiverIDs, users]);

	const totalPoints = useMemo(() => {
		return currentPoints * currentReceiverUsers.length;
	}, [currentPoints, currentReceiverUsers]);

	const onSubmit = useCallback(
		handleSubmit(async (data) => {
			try {
				const result = await createAppreciationAction(data);

				if (result.success) {
					reset();
					toaster.create({
						title: "成功",
						description: "ポストを送信しました",
						type: "success",
					});
				} else {
					toaster.create({
						title: "エラー",
						description: result.error || "ポストを送信できませんでした",
						type: "error",
					});
				}
			} catch (error) {
				toaster.create({
					title: "エラー",
					description:
						error instanceof Error
							? error.message
							: "ポストを送信できませんでした",
					type: "error",
				});
			}
		}),
		[handleSubmit, reset]
	);

	const calculatePoints = useCallback(
		(point: number, sendUsersLength: number) => {
			if (sendUsersLength === 0) return point;
			return Math.floor(point / sendUsersLength);
		},
		[]
	);

	const pointsCollection = useMemo(() => {
		return createListCollection({
			items: initialPoints.map((point) => ({
				value: calculatePoints(point, currentReceiverUsers.length),
				label: `${calculatePoints(point, currentReceiverUsers.length)}pt`,
				disabled:
					calculatePoints(point, currentReceiverUsers.length) *
						currentReceiverUsers.length >
					remainingPoints,
			})),
		});
	}, [calculatePoints, currentReceiverUsers.length, remainingPoints]);

	const onSendUserChange = useCallback(
		(value: ValueChangeDetails<{ value: string; label: string }>) => {
			setValue(
				"receiverIDs",
				value.items.map((item) => item.value)
			);
			trigger("receiverIDs");
		},
		[setValue, trigger]
	);

	const onPointsChange = useCallback(
		(
			value: ValueChangeDetails<{
				value: number;
				label: string;
				disabled: boolean;
			}>
		) => {
			setValue("pointPerReceiver", value.items[0].value);
			trigger("pointPerReceiver");
		},
		[setValue, trigger]
	);

	return {
		register,
		onSubmit,
		onSendUserChange,
		onPointsChange,
		errors,
		usersCollection,
		pointsCollection,
		currentReceiverUsers,
		currentPoints,
		totalPoints,
		isValid,
	};
};
