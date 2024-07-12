import { addDays, format, isWithinInterval, startOfWeek } from "date-fns";
import { cs } from "date-fns/locale";
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

    isGivenDateInThisWeek(dateToCheck: Date): boolean {
      return isWithinInterval(dateToCheck, { start: this.startOfWeek, end: this.endOfWeek });
    }

    getCurrentWeek(): SelectedWeek {
      return new SelectedWeek();
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

    getDayInThisWeekAccordingToIndexStartingFromMonday(index: number): Date {
      return addDays(this.startOfWeek, index)
    }

    getWeekDaysWithDates(): Array<DayOfWeek> {
      const startOfTheWeek = this.startOfWeek;
      const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
      const result = daysOfWeek.map((day, index) => {
        const dayDate = addDays(startOfTheWeek, index);

        return {
          dayName: Calendar.getDayName(dayDate),
          dayInUTC: dayDate.toISOString(),
          date: dayDate,
          dayNumberInMonth: format(dayDate, 'dd', { locale: cs })
        };
      });

      console.log('hmmm', this.startOfWeek)
      console.log(result)
      return result;
    };

    convertSelectedWeekToSimpleISODatesObject(): object {
        return {
          startOfWeek: this.startOfWeek,
          endOfWeek: this.endOfWeek
        }
    }
}

export default SelectedWeek;
