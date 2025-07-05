import { PointLog } from "@/features/common/PointLog";

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
