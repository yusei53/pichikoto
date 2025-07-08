"use client";

import { TopPage } from "@/features/routes/top-page";

type ClientTopPageProps = {
  sendPoint: number;
  receivedPoint: number;
};

const ClientTopPage: React.FC<ClientTopPageProps> = ({
  sendPoint,
  receivedPoint
}) => {
  return <TopPage sendPoint={sendPoint} receivedPoint={receivedPoint} />;
};

export default ClientTopPage;
