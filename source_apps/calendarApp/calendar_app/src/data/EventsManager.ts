import SelectedWeek from "./SelectedWeek";

const mockupEvents = {
    Monday: [
        { title: "Meeting", startTime: "10:30", endTime: "11:00" },
        { title: "Meeting 2", startTime: "10:50", endTime: "11:05" },
        { title: "Meeting 3", startTime: "10:55", endTime: "11:10" },
    ],
    Tuesday: [],
    Wednesday: [],
    Thursday: [{ title: "Workshop", startTime: "15:20", endTime: "16:20" }],
    Friday: [],
    Saturday: [],
    Sunday: [],
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
            res(new Events(mockupEvents))
        }, 1000);
    })
 }
}

export default EventsManager;