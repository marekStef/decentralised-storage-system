import { timeConstants } from "@/constants/timeConstants";

export function convertToLowerMultipleOf5(num: number) : number {
    return Math.round(num / 5) * 5;
}

export function zeroOutTimeInDate(date: Date): Date {
    const dateCopy = new Date(date.getTime());
    dateCopy.setHours(0, 0, 0, 0);
    return dateCopy;
}

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