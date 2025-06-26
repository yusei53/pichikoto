"use client";

import { TopPage } from "@/features/routes/top-page";
import { useTopPage } from "@/features/routes/top-page/hooks/useTopPage";

export const ClientTopPage = () => {
  const { data } = useTopPage();

  if (!data) {
    return null;
  }

  return (
    <TopPage
      sendPoint={data.body.points.sendPoint}
      receivedPoint={data.body.points.receivedPoint}
    />
  );
};
