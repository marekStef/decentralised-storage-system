import { addDays, format, startOfWeek } from "date-fns";
import Calendar from "./Calendar";

export interface DayOfWeek {
  dayName: string,
  dayInUTC: string,
  date: Date,
  dayNumberInMonth: string
}

class SelectedWeek {
    startOfWeek: Date;
    endOfWeek: Date;

    constructor(startOfWeek: Date = Calendar.getStartOfWeek(), endOfWeek: Date = Calendar.getEndOfWeek()) {
        this.startOfWeek = startOfWeek;
        this.endOfWeek = endOfWeek;
    }

    getNextWeek(): SelectedWeek {
      const nextStartOfWeek = new Date(this.startOfWeek);
      nextStartOfWeek.setDate(this.startOfWeek.getDate() + 7);
      const nextEndOfWeek = new Date(this.endOfWeek);
      nextEndOfWeek.setDate(this.endOfWeek.getDate() + 7);

      return new SelectedWeek(nextStartOfWeek, nextEndOfWeek);
    }

    getPreviousWeek(): SelectedWeek {
      const prevStartOfWeek = new Date(this.startOfWeek);
      prevStartOfWeek.setDate(this.startOfWeek.getDate() - 7);
      const prevEndOfWeek = new Date(this.endOfWeek);
      prevEndOfWeek.setDate(this.endOfWeek.getDate() - 7);

      return new SelectedWeek(prevStartOfWeek, prevEndOfWeek);
    }

    getDayInThisWeekAccordingToIndexStartingFromMonday(index: number) {
      console.log("////", this.startOfWeek)
      return addDays(this.startOfWeek, index)
    }

    getWeekDaysWithDates(): Array<DayOfWeek> {
      const startOfTheWeek = startOfWeek(this.startOfWeek, { weekStartsOn: 1 }); // Start week on Monday
      const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
      const result = daysOfWeek.map((day, index) => {
        const dayDate = addDays(startOfTheWeek, index);
        return {
          dayName: Calendar.getDayName(dayDate),
          dayInUTC: dayDate.toISOString(),
          date: dayDate,
          dayNumberInMonth: format(dayDate, 'dd')
        };
      });

      console.log('hmmm')
      console.log(result)
      return result;
    };
}

export default SelectedWeek;
