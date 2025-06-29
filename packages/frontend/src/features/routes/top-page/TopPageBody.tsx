import { PointLog } from "@/components/shared/point/PointLog";

type TopPageBodyProps = {
  sendPoint: number;
  receivedPoint: number;
};

export const TopPageBody: React.FC<TopPageBodyProps> = ({
  sendPoint,
  receivedPoint
}) => {
  return <PointLog sendPoint={sendPoint} receivedPoint={receivedPoint} />;
};
