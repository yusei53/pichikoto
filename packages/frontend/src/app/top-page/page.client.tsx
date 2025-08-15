"use client";

import { TopPage } from "@/features/routes/top-page";

type ClientTopPageProps = {
  sendPoint: number;
  receivedPoint: number;
  remainingPoint: number;
};

const ClientTopPage: React.FC<ClientTopPageProps> = ({
  sendPoint,
  receivedPoint,
  remainingPoint
}) => {
  return (
    <TopPage
      sendPoint={sendPoint}
      receivedPoint={receivedPoint}
      remainingPoint={remainingPoint}
    />
  );
};

export default ClientTopPage;
