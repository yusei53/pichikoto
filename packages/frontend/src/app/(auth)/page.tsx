import { topPageAPI } from "~/features/routes/top-page/endpoints/topPageAPI";
import { mockUser } from "~/mock/user";
import { mockUsers } from "~/mock/user/user";
import { ClientTopPage } from "./page.client";

const TopPage = async () => {
    const posts = await topPageAPI.getPosts();
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
            posts={posts}
        />
    );
};

export default TopPage;
