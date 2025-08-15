import { UnderlinedText } from "@/components/shared/text";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

type PointSetProps = {
  remainPoint: number;
};

export const PointSet: React.FC<PointSetProps> = ({ remainPoint }) => {
  const [value, setValue] = useState<number[]>([20]);
  const [confirmedValue, setConfirmedValue] = useState<number | null>(null);

  const handleConfirm = () => {
    setConfirmedValue(value[0]);
  };

  return (
    <div className="flex flex-col border gap-2 border-current rounded-lg w-[330px] items-center px-4 py-2">
      <UnderlinedText width="md">
        <p className="text-sm text-[#454545]">送るポイントを設定</p>
        <div className="flex items-baseline gap-2">
          <p className="text-sm text-[#454545]">残り</p>
          <p className="text-lg">{remainPoint}</p>
          <p className="text-sm text-[#5E5E5E]">pt</p>
        </div>
      </UnderlinedText>

      {remainPoint === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-[#5E5E5E] mb-2">
            送れるポイントが残っていません
          </p>
        </div>
      ) : (
        <>
          <div className="w-full flex flex-col gap-1">
            <div className="flex justify-between">
              <p className="text-sm text-[#5E5E5E]">0</p>
              <p className="text-sm text-[#5E5E5E]">
                {Math.min(remainPoint, 120)}
              </p>
            </div>
            <Slider
              className="w-full"
              min={0}
              max={Math.min(remainPoint, 120)}
              step={10}
              defaultValue={[20]}
              value={value}
              onValueChange={setValue}
            />
          </div>
          <div className="w-full flex justify-between">
            <p className="text-4xl text-[#5E5E5E] font-bold">{value[0]}pt</p>
            <div className="flex items-end gap-2">
              {/* 後で消す */}
              {confirmedValue !== null && (
                <p className="text-sm text-[#5E5E5E]">{confirmedValue}pt</p>
              )}
              <Button
                variant="outline"
                onClick={handleConfirm}
                disabled={value[0] === 0}
              >
                決定
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
