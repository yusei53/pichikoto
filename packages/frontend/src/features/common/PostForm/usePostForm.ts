import { createListCollection } from "@ark-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { User } from "~/model/user";
import { PostFormValues, createPostSchema } from "./endpoints/postSchema";

type UsePostFormProps = {
    users: User[];
    remainingPoints: number;
};
const initialPoints = [5, 10, 15, 20, 30, 40] as const;

export const usePostForm = ({ users, remainingPoints }: UsePostFormProps) => {
    const postSchema = useMemo(() => createPostSchema(remainingPoints), [remainingPoints]);
    const {
        setValue,
        register,
        handleSubmit,
        formState: { isValid, errors },
        watch,
    } = useForm<PostFormValues>({
        resolver: zodResolver(postSchema),
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
        handleSubmit((data) => {}),
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

    console.log(errors);

    return {
        setValue,
        register,
        onSubmit,
        errors,
        usersCollection,
        pointsCollection,
        currentSendUsers,
        currentPoints,
        totalPoints,
        isValid,
    };
};
