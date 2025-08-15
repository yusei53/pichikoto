import { topPageAPI } from "@/features/routes/top-page/endpoints/topPageAPI";
import ClientTopPage from "./page.client";

const TopPage = async () => {
  const pointLog = await topPageAPI.getPointLog();
  const pointSet = await topPageAPI.getPointSet();
  return (
    <ClientTopPage
      sendPoint={pointLog.sendPoint}
      receivedPoint={pointLog.receivedPoint}
      remainingPoint={pointSet.remainingPoint}
    />
  );
};

export default TopPage;
