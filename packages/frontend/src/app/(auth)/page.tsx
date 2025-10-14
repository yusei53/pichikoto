import { topPageAPI } from "~/features/routes/top-page/endpoints/topPageAPI";
import { mockUser } from "~/mock/user";
import { ClientTopPage } from "./page.client";

// NOTE: プリレンダリングを無効化してビルド時のAPIコールエラーを回避
export const dynamic = "force-dynamic";

const TopPage = async () => {
	const appreciationList = await topPageAPI.getAppreciationList();
	const allUsers = await topPageAPI.getAllUsers();
	const pointLeaders = await topPageAPI.getPointLeaders();
	return (
		<ClientTopPage
			user={mockUser}
			// 1stでは落とす
			isNotificationEnabled={false}
			remainingPoints={100}
			allUsers={allUsers}
			sendPointRanking={pointLeaders.topSenders}
			receivedPointRanking={pointLeaders.topReceivers}
			appreciationList={appreciationList}
		/>
	);
};

export default TopPage;
