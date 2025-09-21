export const useGetAvatarSize = () => {
    const size = ["2xl", "xl", "md"] as const;
    const getAvatarSize = (num: number): (typeof size)[number] => {
        if (num <= 0) return size[0];
        if (num === 1) return size[1];
        return size[2];
    };

    return {
        getAvatarSize,
    };
};
