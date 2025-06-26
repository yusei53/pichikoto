import { UnderlinedText } from "@/components/shared/text/UnderlinedText";
import { Gift, SendHorizontal } from "lucide-react";

type Props = {
  title: string;
  point: number;
  title2: string;
  point2: number;
};

export const PointLog: React.FC<Props> = ({ title, point, title2, point2 }) => {
  return (
    <div className="flex flex-col gap-4 border border-current rounded-lg w-[330px] items-center p-4">
      <UnderlinedText width="md">
        {title}
        <div className="flex items-baseline gap-2">
          <SendHorizontal color="#5E5E5E" />

          <span className="text-4xl font-bold text-[#FFB6B6]">{point}</span>
          <span className="text-sm text-[#5E5E5E]">pt</span>
        </div>
      </UnderlinedText>
      <UnderlinedText width="md">
        {title2}
        <div className="flex items-baseline gap-2">
          <Gift color="#5E5E5E" />

          <span className="text-4xl font-bold text-[#A8CE8F]">{point2}</span>
          <span className="text-sm text-[#5E5E5E]">pt</span>
        </div>
      </UnderlinedText>
    </div>
  );
};
