import React, { useState, useEffect, useRef } from "react";
import "./index.css";

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

const HourLine = ({ position }) => (
    <div
        style={{
            position: "absolute",
            top: `${position}px`,
            left: 0,
            right: 0,
            borderTop: "1px solid gray",
            zIndex: 10,
        }}
    />
);

const CurrentHourLine = ({ position }) => (
    <div
        style={{
            position: "absolute",
            top: `${position}px`,
            left: 0,
            right: 0,
            zIndex: 10,
        }}
    >
        <div
            style={{
                position: "absolute",
                top: "-5px",
                left: "0",
                width: "12px",
                height: "12px",
                backgroundColor: "red",
                borderRadius: "50%",
            }}
        />
        <div
            style={{
                position: "absolute",
                left: 0,
                right: 0,
                borderTop: "2px solid red",
                zIndex: 100,
            }}
        />
    </div>
    
);

// const CurrentHourLine = ({ topOffset, headerHeight }) => {
//     const currentDate = new Date();
//     const currentHour = currentDate.getHours();
//     const currentMinute = currentDate.getMinutes();
//     const hourHeight = calendarHeight / 24;
//     const topPosition = headerHeight + (currentHour + currentMinute / 60) * hourHeight;

//     return (
//         <div
//             style={{
//                 position: "absolute",
//                 top: `${topPosition}px`,
//                 left: 0,
//                 right: 0,
//                 borderTop: "2px solid red", // Make it more visible
//                 zIndex: 20, // Ensure it's above other items but below the sticky header
//             }}
//         />
//     );
// };

const TimeLabel = ({ index, calendarHeight, headerHeight }) => {
    const slotHeight = calendarHeight / 24
    return (
    <div
        key={index}
        style={{
            height: `${slotHeight}px`,
            position: "absolute",
            top: `${headerHeight + index * (slotHeight) - slotHeight / 2.7}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}
    >
        {index}:00
    </div>
)};

const WeekView = () => {
    const [currentTime, setCurrentTime] = useState<Date>(new Date())
    const [currentTimeHorizontalLineOffset, setCurrentTimeHorizontalLineOffset] = useState<number>(0)

    const scrollContainerRef = useRef(null);

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
    const headerHeight = 40;
    // Total height of the calendar (excluding the header)
    const [screenHeight, setScreenHeight] = useState(0);
    const [screenWidth, setScreenWidth] = useState(0);

    const [calendarHeight, setCalendarHeight] = useState(0);
    const [calendarWidth, setCalendarWidth] = useState(0);

    const topOffsetPercentage = 0.2;
    const leftOffsetPercentage = 0.2;

    const calendarTopOffsetInPixels = screenHeight * topOffsetPercentage;
    const numberOfSecondsInDay = 86400
    const currentHourInSeconds = currentTime.getHours() * 60 * 60 + currentTime.getMinutes() * 60 + currentTime.getSeconds()

    const currentHourOffsetInPixels = (calendarHeight / numberOfSecondsInDay) * currentHourInSeconds

    // effect for scrolling the container to the current hour line
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = currentHourOffsetInPixels - 100; // 100px to ensure the line is not right at the top
        }
    }, [calendarHeight]);

    // initial calendarHeight based on the current window dimensions
    useEffect(() => {
        const updateDimensions = () => {
            setScreenHeight(window.innerHeight);
            setScreenWidth(window.innerWidth);

            const offset = window.innerHeight * topOffsetPercentage;
            setCalendarHeight(window.innerHeight * 2 - offset);

            setCalendarWidth(window.innerWidth - leftOffsetPercentage);

            // setCalendarHeight(window.innerHeight * 2 - headerHeight);
        };

        const updateCurrentHour = () => {
            const now = new Date();
            setCurrentTime(now)
        };

        updateDimensions();
        updateCurrentHour();

        const intervalId = setInterval(updateCurrentHour, 1000); // Update every minute

        window.addEventListener("resize", updateDimensions);

        return () => {
            window.removeEventListener("resize", updateDimensions);
            clearInterval(intervalId)
        }
    }, []);

    const handleHourClick = (day: number, hour: number, minute: number) => {
        console.log(`Hour clicked: ${day}, ${hour}:${minute}`);
        alert(`Hour clicked: ${day}, ${hour}:${minute}`);
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
            <div
                style={{
                    height: `${topOffsetPercentage * 100}vh`,
                    position: "absolute",
                    top: 0,
                    width: "100%",
                    zIndex: 2,
                }}
            >
                <h1>{calendarHeight}</h1>
            </div>

            <div
                ref={scrollContainerRef}
                style={{
                    height: `${(1 - topOffsetPercentage) * 100}vh`,
                    // height: `${calendarHeight}px`,
                    top: `${calendarTopOffsetInPixels}px`,
                    left: `${leftOffsetPercentage * 100}vw`,
                    position: "absolute",
                    overflowY: "scroll",
                    width: `${(1 - leftOffsetPercentage) * 100}vw`,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        position: "relative",
                        height: "100vh",
                    }}
                >
                    {/* Current time line */}
                    <CurrentHourLine
                        position={currentHourOffsetInPixels}
                    />

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

                    {/* <div
                        style={{
                            width: "50px",
                            background: "red",
                            height: `${headerHeight}px`,
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                height: `${headerHeight}px`,
                                position: "sticky",
                                top: 0,
                                width: "100%",
                                textAlign: "center",
                                backgroundColor: "red",
                                zIndex: 1,
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                        >
                            Time
                        </div>
                    </div> */}

                    <div
                        style={{
                            display: "flex",
                            flex: 1,
                            //  marginLeft: '50px'
                        }}
                    >
                        <div
                                        style={{
                                            height: `${headerHeight}px`,
                                            position: "sticky",
                                            top: 0,
                                            width: '50px',
                                            textAlign: "center",
                                            backgroundColor: "white",
                                            zIndex: 100,
                                            boxShadow:
                                                "0 2px 4px rgba(0,0,0,0.1)",
                                        }}
                                    >
                                        Time
                                    </div>

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
                                        height: `${
                                            calendarHeight + headerHeight
                                        }px`,
                                    }}
                                >
                                    <div
                                        style={{
                                            height: `${headerHeight}px`,
                                            position: "sticky",
                                            top: 0,
                                            width: "100%",
                                            textAlign: "center",
                                            backgroundColor: "white",
                                            zIndex: 100,
                                            boxShadow:
                                                "0 2px 4px rgba(0,0,0,0.1)",
                                        }}
                                    >
                                        {day}
                                    </div>

                                    {/* Hour Slots */}
                                    {Array.from({ length: 24 }).map(
                                        (_, hour) => {
                                            const slotHeight = calendarHeight / 24
                                            const topOffset = headerHeight + hour * slotHeight;
                                            return (
                                                <div
                                                    key={hour}
                                                    onClick={(e) => {
                                                        const clickY = e.nativeEvent.offsetY;

                                                        const minute = Math.max(0, Math.floor((clickY / slotHeight) * 60 ))

                                                        console.log(clickY)
                                                        handleHourClick(
                                                            day,
                                                            hour,
                                                            minute
                                                        );
                                                    }}
                                                    style={{
                                                        height: `${slotHeight}px`,
                                                        position: "absolute",
                                                        top: `${topOffset}px`,
                                                        width: `100%`,
                                                        // borderTop:
                                                        //     "1px solid gray",
                                                    }}
                                                    className="hover:bg-slate-50"
                                                >
                                                    {/* Empty */}
                                                </div>
                                            );
                                        }
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
