import { addMonths } from "date-fns";

export class SelectedMonth {
    year: number;
    monthIndex: number;
    date: Date;

    constructor(year: number = new Date().getFullYear(), monthIndex: number = new Date().getMonth()) {
        this.year = year;
        this.monthIndex = monthIndex;
        this.date = new Date(year, monthIndex)
    }

    getMonthAfterSkipping(numberOfMonthsToSkip: number): SelectedMonth {
        const nextMonthDate: Date = addMonths(this.date, numberOfMonthsToSkip);
        return new SelectedMonth(nextMonthDate.getFullYear(), nextMonthDate.getMonth());
    }

    getNextMonth(): SelectedMonth {
        return this.getMonthAfterSkipping(1);
    }

    getPrevMonth(): SelectedMonth {
        return this.getMonthAfterSkipping(-1);
    }
}