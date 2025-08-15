import { DiscordLoginButton } from "@/components/shared/auth/DiscordLoginButton";
import { PointLog } from "@/features/common/PointLog";
import { PointSet } from "@/features/common/PointSet";

type TopPageProps = {
  sendPoint: number;
  receivedPoint: number;
  remainingPoint: number;
};

export const TopPage: React.FC<TopPageProps> = ({
  sendPoint,
  receivedPoint,
  remainingPoint
}) => {
  return (
    <div className="pt-48 pl-16">
      <div className="mb-8">
        <DiscordLoginButton />
      </div>
      <div className="pt-8 flex gap-4">
        <PointLog sendPoint={sendPoint} receivedPoint={receivedPoint} />
        <PointSet remainPoint={remainingPoint} />
      </div>
    </div>
  );
};
