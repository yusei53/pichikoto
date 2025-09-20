export const useGetAvatarSize = () => {
    const size = ["2xl", "xl", "lg"] as const
    const getAvatarSize = (num: number) => {
        if (num <= 0) return size[0]
        if (num === 1) return size[1]
        return size[2]
    }

    return {
        getAvatarSize
    }
}