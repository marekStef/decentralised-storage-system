import { format, startOfWeek, endOfWeek, getDay, addDays, formatISO  } from "date-fns";

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

    getWeekDaysWithDates = () => {
        const startOfTheWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start week on Monday
        const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      
        return daysOfWeek.map((day, index) => {
          const dayDate = addDays(startOfTheWeek, index);
          return {
            dayName: day,
            // date: format(dayDate, 'yyyy-MM-dd')
            date: dayDate,
            dayNumberInMonth: format(dayDate, 'dd')
          };
        });
      };
}

export default new WeekDatesClassComponent();
