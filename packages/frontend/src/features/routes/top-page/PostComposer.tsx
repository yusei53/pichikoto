import { PointLog } from "@/features/common/PointLog";

type PostComposerProps = {
  sendPoint: number;
  receivedPoint: number;
};

export const PostComposer: React.FC<PostComposerProps> = ({
  sendPoint,
  receivedPoint
}) => {
  return <PointLog sendPoint={sendPoint} receivedPoint={receivedPoint} />;
};
