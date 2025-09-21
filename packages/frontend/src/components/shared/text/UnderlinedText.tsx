type UnderlinedTextProps = {
    children: React.ReactNode;
    width: widthStyle;
};
type widthStyle = "sm" | "md" | "lg";

export const UnderlinedText: React.FC<UnderlinedTextProps> = ({ children }) => {
    return <div>{children}</div>;
};
