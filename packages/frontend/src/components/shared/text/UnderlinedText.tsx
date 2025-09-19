
type UnderlinedTextProps = {
  children: React.ReactNode;
  width: widthStyle;
};
type widthStyle = "sm" | "md" | "lg";

export const UnderlinedText: React.FC<UnderlinedTextProps> = ({
  children,
  width
}) => {
  const widthClasses = {
    sm: "w-[185px]",
    md: "w-[300px]",
    lg: "w-[600px]"
  };

  return (
    <div>
      {children}
    </div>
  );
};
