import { format, startOfWeek, endOfWeek, getDay, addDays, formatISO  } from "date-fns";
import SelectedWeek from "./SelectedWeek";

class WeekDatesClassComponent {
    getStartOfWeek(date = new Date()) {
        return startOfWeek(date, { weekStartsOn: 1 });
    }

    getEndOfWeek(date = new Date()) {
        return endOfWeek(date, { weekStartsOn: 1 });
    }

    getCurrentDayName(date = new Date()) {
        // const dayNames = [
        //     "Sunday",
        //     "Monday",
        //     "Tuesday",
        //     "Wednesday",
        //     "Thursday",
        //     "Friday",
        //     "Saturday",
        // ];
        // return dayNames[getDay(date)];

        return format(new Date(), "eeee")
    }

    getFormatDateInISO(date = new Date()) {
        return format(date, 'yyyy-MM-dd');
    }

    getReadableDateWithoutTime(date = new Date()) {
        return format(date, 'd.MMMM');
    }

    getCurrentDayNumber(date = new Date()) {
        return parseInt(format(date, 'd'))
    }
}

export default new WeekDatesClassComponent();
