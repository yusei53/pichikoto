import { PointLog } from "@/components/shared/point/PointLog";

type Props = {
  title1: string;
  point1: number;
  title2: string;
  point2: number;
};

export const TopPageBody: React.FC<Props> = ({
  title1,
  point1,
  title2,
  point2
}) => {
  return (
    <PointLog title={title1} point={point1} title2={title2} point2={point2} />
  );
};
