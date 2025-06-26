import { useEffect, useState } from "react";
import { getTopPageData } from "../endpoints/topPageAPI";
import type { TopPageData } from "../type";

export const useTopPage = () => {
  const [data, setData] = useState<TopPageData | null>(null);

  useEffect(() => {
    const fetchTopPageData = async () => {
      const data = await getTopPageData();
      setData(data);
    };

    fetchTopPageData();
  }, []);

  return { data };
};
