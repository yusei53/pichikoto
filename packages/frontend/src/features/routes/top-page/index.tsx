import { TopPageBody } from "./TopPageBody";

type Props = {
  title1: string;
  point1: number;
  title2: string;
  point2: number;
};

export const TopPage: React.FC<Props> = ({
  title1,
  point1,
  title2,
  point2
}) => {
  return (
    <div className="pt-48 pl-16">
      <div className="pt-8">
        <TopPageBody
          title1={title1}
          point1={point1}
          title2={title2}
          point2={point2}
        />
      </div>
    </div>
  );
};
