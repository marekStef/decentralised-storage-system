import React, { useState, useEffect } from "react";
import './index.css';

const getEventHeight = (calendarHeight, durationInMinutes) => {
    const hourHeight = calendarHeight / 24;
    const eventHeight = (durationInMinutes / 60) * hourHeight;
    return eventHeight
}

const Event = ({ event, topOffset, leftOffset, width, calendarHeight }) => {
    const startTime = event.startTime.split(":").map(Number);
    const endTime = event.endTime.split(":").map(Number);
    const durationMinutes =
        endTime[0] * 60 + endTime[1] - (startTime[0] * 60 + startTime[1]);

    const eventHeight = getEventHeight(calendarHeight, durationMinutes)

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
                border: "1px gray solid",
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

const HourLine = ({ position }) => (
    <div
        style={{
            position: "absolute",
            top: `${position}px`,
            left: 0,
            right: 0,
            borderTop: "1px solid grey",
            zIndex: 0,
        }}
    />
);

const TimeLabel = ({ index, calendarHeight, headerHeight }) => (
    <div
        key={index}
        style={{
            height: `${calendarHeight / 24}px`,
            position: "absolute",
            top: `${headerHeight + index * (calendarHeight / 24)}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}
    >
        {index}:00
    </div>
);

const WeekView = () => {
    const [events, setEvents] = useState({
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
    });

    const daysOfWeek = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    // The height of the header with day names
    const headerHeight = 80;
    // Total height of the calendar (excluding the header)
    const [calendarHeight, setCalendarHeight] = useState(0);
    const [calendarWidth, setCalendarWidth] = useState(0);

    const topOffsetPercentage = 0.2;
    const leftOffsetPercentage = 0.2;

    // initial calendarHeight based on the current window dimensions
    useEffect(() => {
        const updateDimensions = () => {
            const offset = window.innerHeight * topOffsetPercentage
            setCalendarHeight(window.innerHeight * 2 - offset);

            setCalendarWidth(window.innerWidth - leftOffsetPercentage)

            // setCalendarHeight(window.innerHeight * 2 - headerHeight);
        };

        updateDimensions();

        window.addEventListener("resize", updateDimensions);

        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    const handleHourClick = (day, hour) => {
        console.log(`Hour clicked: ${day}, ${hour}:00`);
        alert(`Hour clicked: ${day}, ${hour}:00`);
    };

    // Function to calculate top offset based on event's start time
    const calculateTopOffset = (startTime) => {
        const [hours, minutes] = startTime
            .split(":")
            .map((num) => parseInt(num, 10));
        const hourHeight = calendarHeight / 24;
        return headerHeight + hours * hourHeight + (minutes * hourHeight) / 60;
    };

    const adjustEventPositions = (dayEvents) => {
        // Converting event times to minutes for comparison
        const eventsWithPosition = dayEvents.map((event) => ({
            ...event,
            startInMinutes:
                parseInt(event.startTime.split(":")[0], 10) * 60 +
                parseInt(event.startTime.split(":")[1], 10),
            endInMinutes:
                parseInt(event.endTime.split(":")[0], 10) * 60 +
                parseInt(event.endTime.split(":")[1], 10),
            leftOffset: 0,
            width: 100,
        }));

        // Sorting events by start time
        eventsWithPosition.sort((a, b) => a.startInMinutes - b.startInMinutes);

        // Adjusting positions for overlapping events
        eventsWithPosition.forEach((event, index, array) => {
            for (let i = 0; i < index; i++) {
                const otherEvent = array[i];
                if (event.startInMinutes < otherEvent.endInMinutes) {
                    // They overlap
                    event.leftOffset = otherEvent.leftOffset + 20; // Move to the right
                    event.width = 50;
                    otherEvent.width = 50;
                }
            }
        });

        return eventsWithPosition;
    };

    return (
        <div
        style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            width: "99vw",
            paddingTop: `${topOffsetPercentage}vh`,
        }}
        >

            <div style={{ height: `${topOffsetPercentage * 100}vh`, position: "absolute", top: 0, width: "100%", zIndex: 2 }}>
                <h1>hi</h1>
            </div>

            <div style={{ height: `${(1 - topOffsetPercentage) * 100}vh`, top: `${topOffsetPercentage * 100}vh`, left: `${leftOffsetPercentage * 100}vw`, position: "absolute", overflowY: "scroll", width: `${(1 - leftOffsetPercentage) * 100}vw` }}>
                <div
                    style={{
                        display: "flex",
                        position: "relative",
                        height: "100vh",
                    }}
                >
                    {/* Hour Lines */}
                    {Array.from({ length: 24 }).map((_, index) => (
                        <HourLine
                            key={index}
                            position={
                                headerHeight + index * (calendarHeight / 24)
                            }
                        />
                    ))}

                    {/* Time Labels on the Left */}
                    <div style={{ width: "50px", position: "absolute" }}>
                        {Array.from({ length: 24 }).map((_, index) => (
                            <TimeLabel
                                index={index}
                                calendarHeight={calendarHeight}
                                headerHeight={headerHeight}
                            />
                        ))}
                    </div>

                    {/* Day Columns
            <div style={{ display: "flex", flex: 1, marginLeft: "50px" }}>
                {daysOfWeek.map((day) => (
                    <DayColumn
                        key={day}
                        day={day}
                        headerHeight={headerHeight}
                        calendarHeight={calendarHeight}
                        events={events[day]}
                        adjustEventPositions={adjustEventPositions}
                        calculateTopOffset={calculateTopOffset}
                        handleHourClick={handleHourClick}
                    />
                ))}
            </div> */}

                    <div
                        style={{ display: "flex", flex: 1, marginLeft: "50px" }}
                    >
                        {daysOfWeek.map((day) => {
                            const adjustedEvents = adjustEventPositions(
                                events[day]
                            );

                            return (
                                <div
                                    key={day}
                                    style={{
                                        flex: 1,
                                        borderLeft: "1px solid grey",
                                        position: "relative",
                                        height: "100vh",
                                    }}
                                >
                                    <div
                                        style={{
                                            height: `${headerHeight}px`,
                                            position: "absolute",
                                            top: 0,
                                            width: "100%",
                                            textAlign: "center",
                                            borderBottom: "1px solid grey",
                                            backgroundColor: "white",
                                            zIndex: 1,
                                        }}
                                    >
                                        {day}
                                    </div>

                                    {/* Hour Slots */}
                                    {Array.from({ length: 24 }).map(
                                        (_, index) => (
                                            <div
                                                key={index}
                                                onClick={() =>
                                                    handleHourClick(day, index)
                                                }
                                                style={{
                                                    height: `${
                                                        calendarHeight / 24
                                                    }px`,
                                                    position: "absolute",
                                                    top: `${
                                                        headerHeight +
                                                        index *
                                                            (calendarHeight /
                                                                24)
                                                    }px`,
                                                    width: "100%",
                                                    border: "1px solid red",
                                                }}
                                                className="hover:bg-slate-50"
                                            >
                                                {/* Empty */}
                                            </div>
                                        )
                                    )}

                                    {/* Events */}

                                    {adjustedEvents.map((event, index) => (
                                        <Event
                                            key={index}
                                            event={event}
                                            topOffset={calculateTopOffset(
                                                event.startTime
                                            )}
                                            leftOffset={event.leftOffset}
                                            width={event.width}
                                            calendarHeight={calendarHeight}
                                        />
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeekView;
