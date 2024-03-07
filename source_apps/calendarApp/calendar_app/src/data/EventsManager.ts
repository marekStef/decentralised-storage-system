import { addMinutes } from "date-fns";
import Calendar from "./Calendar";
import SelectedWeek from "./SelectedWeek";
import { timeConstants } from "@/constants/timeConstants";
import appConstants from "@/constants/appConstants";

// when updating this event, update EventProfileSchema as well
export class EventPayload {
    startTime: Date;
    endTime: Date;
    color: string;
    title: string;
    description: string;

    constructor(startTime: Date, endTime: Date, title: string, description: string, color: string = "#fff") {
        this.startTime = startTime;
        this.endTime = endTime;
        this.title = title;
        this.description = description;
        this.color = color;
    }
}

export class EventMetadata {
    identifier: string | null;
    createdDate: Date | null;
    profile: string | null;
    source: string | null;
    acceptedDate: Date | null;

    constructor(identifier: string | null = null, createdDate: Date | null = new Date(), source: string | null = null, acceptedDate: Date | null = null) {
        this.identifier = identifier;
        this.createdDate = createdDate;
        this.profile = appConstants.calendarEventProfileName;
        this.source = source;
        this.acceptedDate = acceptedDate;
    }
}

export class Event {
    id: string | null;
    payload: EventPayload;
    metadata: EventMetadata;
    
    constructor(id: string | null, payload: EventPayload, metadata: EventMetadata) {
        this.id = id;
        this.payload = payload;
        this.metadata = metadata;
    }

    getDayOfThisEvent(): Date {
        const dateCopy = new Date(this.payload.startTime.getTime());
        dateCopy.setHours(0, 0, 0, 0);
        return dateCopy;
    }

    static getNewEventWithDefaultDuration(startTime: Date, endTime: Date | null = null): Event {
        if (endTime == null)
            endTime = addMinutes(startTime, timeConstants.THIRTY_MINUTES_IN_MINUTES);
        return new Event(null, new EventPayload(startTime, endTime, "", ""), new EventMetadata());
    }

    getEventInFormForSending(): object {
        console.log('---------', this)
        return {
            payload: this.payload,
            metadata: { 
                ...this.metadata,
                createdDate: this.metadata.createdDate?.toISOString(),
                acceptedDate: this.metadata.acceptedDate?.toISOString()
            }
        };
    }

    // basically converts string dates to javascript Date objects
    static convertEventReceivedFromServerToThisEvent(event: object) {
        return new Event(
            event._id, 
            new EventPayload(new Date(event.payload.startTime), new Date(event.payload.endTime), event.payload.title, event.payload.description, event.payload.color), 
            new EventMetadata(
                event.identifier,
                new Date(event.createdDate),
                event.profile,
                new Date(event.acceptedDate),
            )
        )
    }
}

const mockupEvents2 = [
    new Event(
        "1",
        new EventPayload(new Date(2024, 2, 5, 15, 30, 0), new Date(2024, 2, 5, 18, 45), "New Event 1", "This is some event", "#ccc"),
        new EventMetadata()
    ),
    new Event(
        "2",
        new EventPayload(new Date(2024, 2, 5, 15, 50, 0), new Date(2024, 2, 5, 16, 45), "New Event 1", "This is some event", "#dad"),
        new EventMetadata()
    )
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

                    if (selectedWeek.isGivenDateInThisWeek(current.payload.startTime))
                        events.events[current.getDayOfThisEvent().toISOString()].push(current)
                }

                // console.log(events.events)
                res(events)

            }, 500);
        });
    }
}

export default EventsManager;
