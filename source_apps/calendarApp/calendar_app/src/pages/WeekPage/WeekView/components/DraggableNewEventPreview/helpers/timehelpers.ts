import { timeConstants } from "@/constants/timeConstants";
import { addMinutes } from "date-fns";

export function convertToLowerMultipleOf5(num: number) : number {
    return Math.round(num / 5) * 5;
}

export function zeroOutTimeInDate(date: Date): Date {
    const dateCopy = new Date(date.getTime());
    dateCopy.setHours(0, 0, 0, 0);
    return dateCopy;
}

export function setTime(baseDate: Date, hour: number, minute: number): Date {
    baseDate.setHours(hour);
    baseDate.setMinutes(minute, 0, 0);

    return baseDate;
}

export function addDurationToTime(baseDate: Date, durationInMinutes: number): Date {
    return addMinutes(baseDate, durationInMinutes);
}