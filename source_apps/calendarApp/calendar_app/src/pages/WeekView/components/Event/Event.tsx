import { Event } from "@/data/EventsManager";
import React from "react";

const getEventHeight = (calendarHeight: number, durationInMinutes: number) => {
    const hourHeight = calendarHeight / 24;
    const eventHeight = (durationInMinutes / 60) * hourHeight;
    return eventHeight;
};

interface EventUIParams {
    event: Event;
    topOffset: number;
    leftOffset: number;
    width: number;
    calendarHeight: number;
}

const EventUI: React.FC<EventUIParams> = (params) => {
    // const startTime = event.startTime.split(":").map(Number);
    // const endTime = event.endTime.split(":").map(Number);
    const durationMinutes = params.event.endTime.getHours() * 60 + params.event.endTime.getMinutes() 
        - (params.event.startTime.getHours() * 60 + params.event.startTime.getMinutes());

    const eventHeight = getEventHeight(params.calendarHeight, durationMinutes);

    const fontSize = "11px";

    return (
            <div
                style={{
                    position: "absolute",
                    top: `${params.topOffset}px`,
                    left: `${params.leftOffset}%`,
                    width: `${params.width}%`,
                    height: `${eventHeight}px`,
                    padding: "1px",
                    margin: "1px 0",
                    borderRadius: "5px",
                    fontSize: fontSize,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    border: "1px #ccc solid",
                    backgroundColor: params.event.color ?? 'white',
                    zIndex: 50
                }}
                className="hover:shadow-md cursor-pointer"
            >
                <strong title={params.event.title}>
                    <p>{params.event.title}</p>
                    <p>{params.event.description}</p>
                    {/* {params.event.title.substring(0, 10) +
                        (params.event.title.length > 10 ? "..." : "")}{" "} */}
                    {params.event.startTime.toISOString()} - {params.event.endTime.toISOString()}
                </strong>{" "}
                <br />
                </div>

    );
};

export default EventUI;