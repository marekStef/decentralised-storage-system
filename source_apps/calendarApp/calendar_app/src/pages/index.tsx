import React, { useState, useEffect } from "react";

// Represents a single event
const Event = ({ event, topOffset, leftOffset, width }) => (
    <div
        style={{
            position: "absolute",
            top: `${topOffset}px`,
            left: `${leftOffset}%`,
            width: `${width}%`,
            padding: "5px",
            margin: "1px 0",
            backgroundColor: "lightgrey",
            borderRadius: "5px",
        }}
    >
        <strong>{event.title}</strong> <br />
        {event.startTime} - {event.endTime}
    </div>
);

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

const HourSlot = ({
    day,
    index,
    calendarHeight,
    headerHeight,
    handleHourClick,
}) => (
    <div
        key={index}
        onClick={() => handleHourClick(day, index)}
        style={{
            height: `${calendarHeight / 24}px`,
            position: "absolute",
            top: `${headerHeight + index * (calendarHeight / 24)}px`,
            width: "100%",
            cursor: "pointer",
            ":hover": {
                backgroundColor: "#f0f0f0", // This will only work with a CSS-in-JS library that supports pseudo-selectors
            },
        }}
    >
        {/* Empty div for hour slot */}
    </div>
);

const DayColumn = ({
    day,
    headerHeight,
    calendarHeight,
    events,
    adjustEventPositions,
    calculateTopOffset,
    handleHourClick,
}) => {
    const adjustedEvents = adjustEventPositions(events);

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
            {Array.from({ length: 24 }).map((_, index) => (
                <HourSlot
                    key={index}
                    day={day}
                    index={index}
                    calendarHeight={calendarHeight}
                    headerHeight={headerHeight}
                    handleHourClick={handleHourClick}
                />
            ))}

            {/* Events */}
            {adjustedEvents.map((event, index) => (
                <Event
                    key={index}
                    event={event}
                    topOffset={calculateTopOffset(event.startTime)}
                    leftOffset={event.leftOffset}
                    width={event.width}
                />
            ))}
        </div>
    );
};

const WeekView = () => {
    const [events, setEvents] = useState({
        Monday: [
            { title: "Meeting", startTime: "10:30", endTime: "11:00" },
            { title: "Meeting 2", startTime: "10:50", endTime: "11:00" },
            { title: "Meeting 3", startTime: "10:55", endTime: "11:00" },
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
    const headerHeight = 80; // Adjust this value to match your actual header height
    // Total height of the calendar (excluding the header)
    const [calendarHeight, setCalendarHeight] = useState(0);

    useEffect(() => {
        setCalendarHeight(window.innerHeight - headerHeight);
    }, []);

    // Set the initial calendarHeight based on the current window dimensions
    useEffect(() => {
        const updateDimensions = () => {
            setCalendarHeight(window.innerHeight - headerHeight);
        };

        updateDimensions();

        window.addEventListener("resize", updateDimensions);

        // Cleanup of the event listener when the component unmounts
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
                if (event.startInMinutes < otherEvent.endInMinutes) { // They overlap
                    event.leftOffset = otherEvent.leftOffset + 20; // Move to the right
                    event.width = 50;
                    otherEvent.width = 50;
                }
            }
        });

        return eventsWithPosition;
    };

    return (
        <div style={{ display: "flex", position: "relative", height: "100vh" }}>
            {/* Hour Lines */}
            {Array.from({ length: 24 }).map((_, index) => (
                <HourLine
                    key={index}
                    position={headerHeight + index * (calendarHeight / 24)}
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

            <div style={{ display: "flex", flex: 1, marginLeft: "50px" }}>
                {daysOfWeek.map((day) => {
                    const adjustedEvents = adjustEventPositions(events[day]);

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
                            {Array.from({ length: 24 }).map((_, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleHourClick(day, index)}
                                    style={{
                                        height: `${calendarHeight / 24}px`,
                                        position: "absolute",
                                        top: `${
                                            headerHeight +
                                            index * (calendarHeight / 24)
                                        }px`,
                                        width: "100%",
                                        cursor: "pointer",
                                        border: "1px solid red",
                                    }}
                                    className="bg-red-600"
                                >
                                    {/* Empty */}
                                </div>
                            ))}

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
                                />
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeekView;
