import { PointLog } from "@/components/shared/point/PointLog";

type Props = {
  sendPoint: number;
  receivedPoint: number;
};

export const TopPageBody: React.FC<Props> = ({ sendPoint, receivedPoint }) => {
  return (
    <PointLog
      sendLabel="今週送れる"
      sendPoint={sendPoint}
      receivedLabel="今月もらった"
      receivedPoint={receivedPoint}
    />
  );
};
