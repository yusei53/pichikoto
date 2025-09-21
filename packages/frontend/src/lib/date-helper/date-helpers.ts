import { format } from "date-fns";

export const formatDate = (date: Date) => {
    const formattedDate = format(new Date(date), "yyyy.MM.dd");
    const weekday = format(new Date(date), "eee").toUpperCase();
    return `${formattedDate} ${weekday}`;
};
