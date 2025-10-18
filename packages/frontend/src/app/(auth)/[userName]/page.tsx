import { notFound } from "next/navigation";
import { userPageAPIServer } from "~/features/routes/user-page/endpoints/userPageAPI.server";
import { UserPageClient } from "./page.client";

export default async function Page({
	params,
}: {
	params: Promise<{ userName: string }>;
}) {
	const resolvedParams = await params;
	const userName = resolvedParams.userName;

	const currentUser = await userPageAPIServer.getCurrentUser();
	const targetUser = await userPageAPIServer.getUserByName(userName);
	if (targetUser === null) notFound();

	const appreciationList = await userPageAPIServer.getAppreciationList();
	const allUsers = await userPageAPIServer.getAllUsers();
	const isOwnUser = targetUser.discordUserName === currentUser.discordUserName;

	return (
		<UserPageClient
			user={targetUser}
			isOwnUser={isOwnUser}
			isNotificationEnabled={false}
			appreciationList={appreciationList}
			allUsers={allUsers}
			sendUserList={[]}
			receivedUserList={[]}
		/>
	);
}
