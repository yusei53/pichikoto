"use client";

import { TopPage } from "@/features/routes/top-page";
import type { TopPageData } from "@/features/routes/top-page/type";

export const ClientTopPage = ({ data }: { data: TopPageData }) => {
  return (
    <TopPage
      sendPoint={data.body.points.sendPoint}
      receivedPoint={data.body.points.receivedPoint}
    />
  );
};
