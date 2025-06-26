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
      title1={data.body.points.title1}
      point1={data.body.points.sendPoint}
      title2={data.body.points.title2}
      point2={data.body.points.receivePoint}
    />
  );
};
