import Calendar from "./Calendar";

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

}

export default SelectedWeek;
