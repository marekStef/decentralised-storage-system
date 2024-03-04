import { zeroOutTimeInDate } from "@/pages/WeekView/components/DraggableNewEventPreview/helpers/timehelpers";
import Calendar from "./Calendar";
import SelectedWeek from "./SelectedWeek";

export class Event {
    id: string;
    startTime: Date;
    endTime: Date;
    color: string;

    title: string;
    description: string;
    constructor(id: string, startTime: Date, endTime: Date, title: string, description: string, color: string) {
        this.id = id;
        this.startTime = startTime;
        this.endTime = endTime;
        this.title = title;
        this.description = description;
        this.color = color;
    }
}

const mockupEvents2 = [
    new Event("1", new Date(2024, 2, 5, 15, 30, 0), new Date(2024, 2, 5, 18, 45), "New Event 1", "This is some event", "#ccc"),
    new Event("2", new Date(2024, 2, 5, 15, 50, 0), new Date(2024, 2, 5, 16, 45), "New Event 1", "This is some event", "#dad"),
]

export type EventsMap = { [key: string]: Event[] }

export class Events {
    events: EventsMap = {}

    constructor(events: EventsMap = {}) {
        this.events = events;
    }

}

class EventsManager {
    getEventsForSelectedWeek(selectedWeek: SelectedWeek): Promise<Events> {
        return new Promise<Events>((res, rej) => {
            setTimeout(() => {

                const events = new Events()

                for (let i = 0; i < 7; ++i) {
                    events.events[selectedWeek.getDayInThisWeekAccordingToIndexStartingFromMonday(i).toISOString()] = []
                }

                // console.log(events.events)

                for (let j = 0;  j < mockupEvents2.length; ++j) {
                    const current = mockupEvents2[j];

                    if (selectedWeek.isGivenDateInThisWeek(current.startTime))
                        events.events[zeroOutTimeInDate(current.startTime).toISOString()].push(current)
                }

                // console.log(events.events)
                res(events)

            }, 500);
        });
    }
}

export default EventsManager;
