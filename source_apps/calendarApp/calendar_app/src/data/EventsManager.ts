import { addMinutes } from "date-fns";
import Calendar from "./Calendar";
import SelectedWeek from "./SelectedWeek";
import { timeConstants } from "@/constants/timeConstants";

// when updating this event, update EventProfileSchema as well
export class Event {
    id: string;
    startTime: Date;
    endTime: Date;
    color: string;

    title: string;
    description: string;
    constructor(startTime: Date, endTime: Date, title: string, description: string, color: string = "#fff", id: string = "") {
        this.id = id;
        this.startTime = startTime;
        this.endTime = endTime;
        this.title = title;
        this.description = description;
        this.color = color;
    }

    getDayOfThisEvent(): Date {
        const dateCopy = new Date(this.startTime.getTime());
        dateCopy.setHours(0, 0, 0, 0);
        return dateCopy;
    }

    static getNewEventWithDefaultDuration(startTime: Date, endTime: Date | null = null): Event {
        if (endTime == null)
            endTime = addMinutes(startTime, timeConstants.THIRTY_MINUTES_IN_MINUTES);
        return new Event(startTime, endTime, "", "");
    }
}

const mockupEvents2 = [
    new Event(new Date(2024, 2, 5, 15, 30, 0), new Date(2024, 2, 5, 18, 45), "New Event 1", "This is some event", "#ccc", "1"),
    new Event(new Date(2024, 2, 5, 15, 50, 0), new Date(2024, 2, 5, 16, 45), "New Event 1", "This is some event", "#dad", "2"),
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
                        events.events[current.getDayOfThisEvent().toISOString()].push(current)
                }

                // console.log(events.events)
                res(events)

            }, 500);
        });
    }

    // createNewEvent(event: Event): Promise<boolean> {
    //     return new Promise((res, rej) => {
    //         event.id = event.startTime.toISOString() + event.endTime.toISOString();
    //         mockupEvents2.push(event)
    //         setTimeout(() => {
    //             res({
    //                 _id: event.id
    //             });
    //         }, 500)
    //     })
    // }
}

export default EventsManager;
