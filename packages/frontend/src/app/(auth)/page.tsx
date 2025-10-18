import { topPageAPIServer } from "~/features/routes/top-page/endpoints/topPageAPI.server";
import { ClientTopPage } from "./page.client";

// NOTE: プリレンダリングを無効化してビルド時のAPIコールエラーを回避
export const dynamic = "force-dynamic";

const TopPage = async () => {
	const appreciationList = await topPageAPIServer.getAppreciationList();
	const allUsers = await topPageAPIServer.getAllUsers();
	const pointLeaders = await topPageAPIServer.getPointLeaders();
	const userInfo = await topPageAPIServer.getUserInfo();
	return (
		<ClientTopPage
			userInfo={userInfo}
			// 1stでは落とす
			isNotificationEnabled={false}
			allUsers={allUsers}
			sendPointRanking={pointLeaders.topSenders}
			receivedPointRanking={pointLeaders.topReceivers}
			appreciationList={appreciationList}
		/>
	);
};

export default TopPage;
