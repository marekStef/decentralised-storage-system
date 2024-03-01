import Calendar from "./Calendar";
import SelectedWeek from "./SelectedWeek";

const mockupEvents = (selectedWeek: SelectedWeek) => {
    let result = {};

    // monday
    result[selectedWeek.getDayInThisWeekAccordingToIndexStartingFromMonday(0).toISOString()] = [
        { title: "Meeting", startTime: "10:30", endTime: "11:00" },
        { title: "Meeting 2", startTime: "10:50", endTime: "11:05" },
        { title: "Meeting 3", startTime: "10:55", endTime: "11:10" },
    ]

    // tuesday
    result[selectedWeek.getDayInThisWeekAccordingToIndexStartingFromMonday(1).toISOString()] = [
        { title: "Meeting", startTime: "10:30", endTime: "11:00" },
    ]

    // wednesday
    result[selectedWeek.getDayInThisWeekAccordingToIndexStartingFromMonday(2).toISOString()] = [
    ]

    // thursday
    result[selectedWeek.getDayInThisWeekAccordingToIndexStartingFromMonday(3).toISOString()] = [
        { title: "Meeting", startTime: "10:30", endTime: "11:00", color: '#3cd' },
        { title: "Workshop", startTime: "15:20", endTime: "16:20", color: '#3cd' }
    ]

    // friday
    result[selectedWeek.getDayInThisWeekAccordingToIndexStartingFromMonday(4).toISOString()] = [
        { title: "Meeting", startTime: "10:30", endTime: "11:00", color: '#3cd' },
        { title: "Workshop", startTime: "15:20", endTime: "16:20", color: '#3cd' }
    ]

    // saturday
    result[selectedWeek.getDayInThisWeekAccordingToIndexStartingFromMonday(5).toISOString()] = [
        { title: "Meeting", startTime: "10:30", endTime: "11:00", color: '#3cd' },
        { title: "Workshop", startTime: "15:20", endTime: "16:20", color: '#3cd' }
    ]

    // sunday
    result[selectedWeek.getDayInThisWeekAccordingToIndexStartingFromMonday(6).toISOString()] = [
        { title: "Meeting", startTime: "10:30", endTime: "11:00", color: '#3cd' },
        { title: "Workshop", startTime: "15:20", endTime: "16:20", color: '#3cd' }
    ]

    console.log(JSON.stringify(result))

    return result;
};

export class Events {
    events: any;
    constructor(events: any = {}) {
        this.events = events;
    }
}

class EventsManager {
    getEventsForSelectedWeek(selectedWeek: SelectedWeek) {
        return new Promise((res, rej) => {
            setTimeout(() => {
                res(new Events(mockupEvents(selectedWeek)));
            }, 1000);
        });
    }
}

export default EventsManager;
