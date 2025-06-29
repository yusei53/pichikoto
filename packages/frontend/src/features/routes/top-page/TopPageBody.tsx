import { PointLog } from "@/components/shared/point/PointLog";

type TopPageBodyProps = {
  sendPoint: number;
  receivedPoint: number;
};

export const TopPageBody: React.FC<TopPageBodyProps> = ({
  sendPoint,
  receivedPoint
}) => {
  return (
    <PointLog
      sendLabel="今週送れる"
      sendPoint={sendPoint}
      receivedLabel="今月もらった"
      receivedPoint={receivedPoint}
    />
  );
};
