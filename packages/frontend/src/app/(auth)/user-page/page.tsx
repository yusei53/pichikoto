import { userPageAPI } from "~/features/routes/user-page/endpoints/userPageAPI";
import { useParseParams } from "~/features/routes/user-page/useParseParams";
import { mockUsers } from "~/mock/user/user";
import { UserPageClient } from "./page.client";

export default async function Page({
	searchParams,
}: {
	searchParams?: { [key: string]: string | string[] | undefined };
}) {
	const currentUser = await userPageAPI.getCurrentUser();
	const paramUserId = useParseParams(searchParams?.["user-id"]);
	const targetUserId = paramUserId ?? currentUser.userID;
	const targetUser = await userPageAPI.getUserById(targetUserId);
	const appreciationList = await userPageAPI.getAppreciationList();

	const user = targetUser ?? currentUser;
	const isOwnUser = user.userID === currentUser.userID;

	return (
		<UserPageClient
			user={user}
			isOwnUser={isOwnUser}
			isNotificationEnabled={false}
			appreciationList={appreciationList}
			allUsers={mockUsers}
			sendUserList={[]}
			receivedUserList={[]}
		/>
	);
}
