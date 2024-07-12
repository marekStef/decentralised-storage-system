import { format, startOfWeek, endOfWeek, getDay, addDays, formatISO  } from "date-fns";
import { cs } from "date-fns/locale";
import SelectedWeek from "./SelectedWeek";

class WeekDatesClassComponent {
    getStartOfWeek(date = new Date()) {
        return startOfWeek(date, { weekStartsOn: 1, locale: cs  });
    }

    getEndOfWeek(date = new Date()) {
        return endOfWeek(date, { weekStartsOn: 1, locale: cs  });
    }

    getDayName(date = new Date()) {
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

        return format(date, "eee")
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
