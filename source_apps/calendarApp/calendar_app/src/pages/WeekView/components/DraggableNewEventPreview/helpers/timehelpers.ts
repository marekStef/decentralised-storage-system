import { timeConstants } from "@/constants/timeConstants";

export function createTime(hour: number, minute: number): Date {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    const dateWithTime = new Date(year, month, day, hour, minute);

    return dateWithTime;
}

export function addDurationToTime(hour: number, minute: number, durationInMinutes: number): Date {
    const initialDate = createTime(hour, minute);

    const newTime = new Date(initialDate.getTime() + durationInMinutes * timeConstants.NUMBER_OF_MILLISECONDS_IN_A_MINUTE);

    return newTime;
}