import { createListCollection } from "@ark-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toaster } from "~/components/shared/AppToaster/AppToaster";
import type { ValueChangeDetails } from "~/components/ui/styled/combobox";
import type { User } from "~/model/user";
import type { AppreciationValues } from "./endpoints/appreciationSchema";
import { createAppreciationSchema } from "./endpoints/appreciationSchema";

type UseAppreciationFormProps = {
	users: User[];
	remainingPoints: number;
};
const initialPoints = [5, 10, 15, 20, 30, 40] as const;

export const useAppreciationForm = ({ users, remainingPoints }: UseAppreciationFormProps) => {
	const postSchema = useMemo(() => createAppreciationSchema(remainingPoints), [remainingPoints]);
	const {
		setValue,
		register,
		handleSubmit,
		watch,
		trigger,
		formState: { isValid, errors },
	} = useForm<AppreciationValues>({
		resolver: zodResolver(postSchema),
		mode: "onChange",
		defaultValues: {
			sendUserID: [],
			message: "",
			points: 0,
		},
	});

	const sendUserID = watch("sendUserID");
	const currentPoints = watch("points");

	const usersCollection = useMemo(() => {
		return createListCollection({
			items: users.map((user) => ({
				value: user.userID,
				label: user.discordUserName,
				avatarUrl: user.discordAvatar,
			})),
		});
	}, [users]);

	const currentSendUsers = useMemo(() => {
		return users.filter((user) => sendUserID.includes(user.userID));
	}, [sendUserID, users]);

	const totalPoints = useMemo(() => {
		return currentPoints * currentSendUsers.length;
	}, [currentPoints, currentSendUsers]);

	const onSubmit = useCallback(
		handleSubmit((data) => {
			toaster.create({
				title: "成功",
				description: "ポストを送信しました",
				type: "success",
			});
			console.log(data);
		}),
		[handleSubmit]
	);

	const calculatePoints = useCallback((point: number, sendUsersLength: number) => {
		if (sendUsersLength === 0) return point;
		return Math.floor(point / sendUsersLength);
	}, []);

	const pointsCollection = useMemo(() => {
		return createListCollection({
			items: initialPoints.map((point) => ({
				value: calculatePoints(point, currentSendUsers.length),
				label: `${calculatePoints(point, currentSendUsers.length)}pt`,
				disabled:
					calculatePoints(point, currentSendUsers.length) * currentSendUsers.length >
					remainingPoints,
			})),
		});
	}, [calculatePoints, currentSendUsers.length, remainingPoints]);

	const onSendUserChange = useCallback(
		(value: ValueChangeDetails<{ value: string; label: string }>) => {
			setValue(
				"sendUserID",
				value.items.map((item) => item.value)
			);
			trigger("sendUserID");
		},
		[setValue, trigger]
	);

	const onPointsChange = useCallback(
		(value: ValueChangeDetails<{ value: number; label: string; disabled: boolean }>) => {
			setValue("points", value.items[0].value);
			trigger("points");
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
		currentSendUsers,
		currentPoints,
		totalPoints,
		isValid,
	};
};
