import { topPageAPI } from "~/features/routes/top-page/endpoints/topPageAPI";
import ClientTopPage from "./page.client";

const TopPage = async () => {
    const pointLog = await topPageAPI.getPointLog();
    return <ClientTopPage sendPoint={pointLog.sendPoint} receivedPoint={pointLog.receivedPoint} />;
};

export default TopPage;
