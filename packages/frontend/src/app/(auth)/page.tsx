import { topPageAPI } from "~/features/routes/top-page/endpoints/topPageAPI";
import { mockUser } from "~/mock/user";
import { ClientTopPage } from "./page.client";

const TopPage = async () => {
    const posts = await topPageAPI.getPosts();
    const receivedPointRanking = await topPageAPI.getReceivedPointRanking();
    const sendPointRanking = await topPageAPI.getSendPointRanking();
    return (
        <ClientTopPage
            user={mockUser}
            isNotificationEnabled
            sendPointRanking={sendPointRanking}
            receivedPointRanking={receivedPointRanking}
            posts={posts}
        />
    );
};

export default TopPage;
