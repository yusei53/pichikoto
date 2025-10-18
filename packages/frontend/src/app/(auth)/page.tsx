import { topPageAPIServer } from "~/features/routes/top-page/endpoints/topPageAPI.server";
import { ClientTopPage } from "./page.client";

// ISR（Incremental Static Regeneration）を使用
// 60秒間キャッシュを保持し、その後バックグラウンドで再生成
// Server ActionのrevalidateTagで即座にキャッシュを無効化することも可能
export const revalidate = 60;

const TopPage = async () => {
	const appreciationList = await topPageAPIServer.getAppreciationList();
	const allUsers = await topPageAPIServer.getAllUsers();
	const pointLeaders = await topPageAPIServer.getPointLeaders();
	const userInfo = await topPageAPIServer.getUserInfo();
	return (
		<ClientTopPage
			userInfo={userInfo}
			isNotificationEnabled={false}
			allUsers={allUsers}
			sendPointRanking={pointLeaders.topSenders}
			receivedPointRanking={pointLeaders.topReceivers}
			appreciationList={appreciationList}
		/>
	);
};

export default TopPage;
