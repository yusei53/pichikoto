import { PointLog } from "@/features/common/PointLog";

type TopPageProps = {
  sendPoint: number;
  receivedPoint: number;
};

export const TopPage: React.FC<TopPageProps> = ({
  sendPoint,
  receivedPoint
}) => {
  return (
    <div className="pt-48 pl-16">
      <div className="pt-8">
        <PointLog sendPoint={sendPoint} receivedPoint={receivedPoint} />
      </div>
    </div>
  );
};
