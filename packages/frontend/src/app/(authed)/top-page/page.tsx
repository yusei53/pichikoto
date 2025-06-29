import { topPageAPI } from "@/features/routes/top-page/endpoints/topPageAPI";
import { ClientTopPage } from "./page.client";

const TopPage = async () => {
  const data = await topPageAPI.getPointLog();
  return <ClientTopPage data={data} />;
};

export default TopPage;
