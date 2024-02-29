import React from "react";


const getEventHeight = (calendarHeight, durationInMinutes) => {
    const hourHeight = calendarHeight / 24;
    const eventHeight = (durationInMinutes / 60) * hourHeight;
    return eventHeight;
};

const Event = ({ event, topOffset, leftOffset, width, calendarHeight }) => {
    const startTime = event.startTime.split(":").map(Number);
    const endTime = event.endTime.split(":").map(Number);
    const durationMinutes =
        endTime[0] * 60 + endTime[1] - (startTime[0] * 60 + startTime[1]);

    const eventHeight = getEventHeight(calendarHeight, durationMinutes);

    const fontSize = "11px";

    return (
        <div
            style={{
                position: "absolute",
                top: `${topOffset}px`,
                left: `${leftOffset}%`,
                width: `${width}%`,
                height: `${eventHeight}px`,
                padding: "1px",
                margin: "1px 0",
                borderRadius: "5px",
                fontSize: fontSize,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                border: "1px #ccc solid",
                zIndex: 50
            }}
            className="bg-slate-100 hover:bg-slate-200 cursor-pointer"
        >
            <strong title={event.title}>
                {event.title.substring(0, 10) +
                    (event.title.length > 10 ? "..." : "")}{" "}
                {event.startTime} - {event.endTime}
            </strong>{" "}
            <br />
        </div>
    );
};

export default Event;