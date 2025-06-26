import { UnderlinedText } from "@/components/shared/text/UnderlinedText";
import { Gift, SendHorizontal } from "lucide-react";

type Props = {
  sendLabel: string;
  sendPoint: number;
  receivedLabel: string;
  receivedPoint: number;
};

export const PointLog: React.FC<Props> = ({
  sendLabel,
  sendPoint,
  receivedLabel,
  receivedPoint
}) => {
  return (
    <div className="flex flex-col gap-4 border border-current rounded-lg w-[330px] items-center p-4">
      <UnderlinedText width="md">
        {sendLabel}
        <div className="flex items-baseline gap-2">
          <SendHorizontal color="#5E5E5E" />

          <span className="text-4xl font-bold text-[#FFB6B6]">{sendPoint}</span>
          <span className="text-sm text-[#5E5E5E]">pt</span>
        </div>
      </UnderlinedText>
      <UnderlinedText width="md">
        {receivedLabel}
        <div className="flex items-baseline gap-2">
          <Gift color="#5E5E5E" />

          <span className="text-4xl font-bold text-[#A8CE8F]">
            {receivedPoint}
          </span>
          <span className="text-sm text-[#5E5E5E]">pt</span>
        </div>
      </UnderlinedText>
    </div>
  );
};
