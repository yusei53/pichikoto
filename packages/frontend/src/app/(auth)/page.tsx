import { topPageAPI } from "~/features/routes/top-page/endpoints/topPageAPI";
import { mockUser } from "~/mock/user";
import { mockUsers } from "~/mock/user/user";
import { ClientTopPage } from "./page.client";

const TopPage = async () => {
	const appreciationList = await topPageAPI.getAppreciationList();
	const receivedPointRanking = await topPageAPI.getReceivedPointRankings();
	const sendPointRanking = await topPageAPI.getSendPointRankings();
	return (
		<ClientTopPage
			user={mockUser}
			// 1stでは落とす
			isNotificationEnabled={false}
			remainingPoints={100}
			allUsers={mockUsers}
			sendPointRanking={sendPointRanking}
			receivedPointRanking={receivedPointRanking}
			appreciationList={appreciationList}
		/>
	);
};

export default TopPage;
