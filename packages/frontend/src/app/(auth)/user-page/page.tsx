import { userPageAPI } from "~/features/routes/user-page/endpoints/userPageAPI";
import { useParseParams } from "~/features/routes/user-page/useParseParams";
import { UserPageClient } from "./page.client";

export default async function Page({
	searchParams,
}: {
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const resolvedSearchParams = (await searchParams) ?? {};
	const currentUser = await userPageAPI.getCurrentUser();
	const paramUserId = useParseParams(resolvedSearchParams?.["user-id"]);
	const targetUserId = paramUserId ?? currentUser.discordUserID;
	const targetUser = await userPageAPI.getUserById(targetUserId);
	const appreciationList = await userPageAPI.getAppreciationList();
	const allUsers = await userPageAPI.getAllUsers();
	const user = targetUser ?? currentUser;
	const isOwnUser = user.discordUserID === currentUser.discordUserID;

	return (
		<UserPageClient
			user={user}
			isOwnUser={isOwnUser}
			isNotificationEnabled={false}
			appreciationList={appreciationList}
			allUsers={allUsers}
			sendUserList={[]}
			receivedUserList={[]}
		/>
	);
}
