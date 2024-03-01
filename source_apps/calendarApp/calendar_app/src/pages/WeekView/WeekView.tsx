import React, { useState, useEffect, useRef } from "react";
import "./index.css";
import { colors } from "@/constants/colors";
import Calendar from "@/data/Calendar";

import Event from "./components/Event/Event";
import HourLine from "./components/HourLines/HourLine";
import CurrentHourLine from "./components/HourLines/CurrentHourLine";
import TimeLabel from "./components/TimeLabel/TimeLabel";

import SelectedWeek, { DayOfWeek } from "@/data/SelectedWeek";
import EventsManager, { Events } from "@/data/EventsManager";
import { SyncLoader } from "react-spinners";
import { timeConstants } from "@/constants/timeConstants";

interface WeekViewParams {
    screenHeight: number,
    screenWidth: number,
    calendarViewTopOffsetPercentage: number,
    calendarViewLeftOffsetPercentage: number,
    selectedWeek: SelectedWeek,
    openNewEventDialogHandler: (day: DayOfWeek, hour: number, minute: number) => void
}

const eventsManager = new EventsManager();

const WeekView: React.FC<WeekViewParams> = (params) => {
    const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date())
    const [currentTimeHorizontalLineOffset, setCurrentTimeHorizontalLineOffset] = useState<number>(0)

    // console.log(Calendar.getCurrentDayName())
    // console.log(Calendar.getWeekDaysWithDates());
    const scrollContainerRef = useRef(null);

    const [events, setEvents] = useState<Events>(new Events());

    const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(true)

    // console.log(Calendar.getFormatDateInISO())

    const [daysOfWeek, setDaysOfWeek] = useState<Array<DayOfWeek> | null>(null)

    // The height of the header with day names
    const headerHeight = 60;
    const calendarLeftColumnHoursWidthInPixels = 50
    // Total height of the calendar (excluding the header)
    const [calendarHeight, setCalendarHeight] = useState(0);
    const [calendarWidth, setCalendarWidth] = useState(0);

    const calendarTopOffsetInPixels = params.screenHeight * params.calendarViewTopOffsetPercentage;
    const currentHourInSeconds = currentDateTime.getHours() * 60 * 60 + currentDateTime.getMinutes() * 60 + currentDateTime.getSeconds()

    const calendarHeightWithoutHeader = calendarHeight - headerHeight;

    const currentHourOffsetInPixels = (calendarHeightWithoutHeader / timeConstants.NUMBER_OF_SECONDS_IN_DAY) * currentHourInSeconds

    // useEffect(() => {
    //     setDaysOfWeek(Calendar.getWeekDaysWithDates(params.selectedWeek))
    // }, [])

    useEffect(() => {
        console.log("Loading for: ", params.selectedWeek.startOfWeek)
        setDaysOfWeek(params.selectedWeek.getWeekDaysWithDates())

        setEvents(new Events())
        setIsLoadingEvents(true);
        
        eventsManager.getEventsForSelectedWeek(params.selectedWeek)
            .then(events => {
                setEvents(events)
                setIsLoadingEvents(false)
            })
    }, [params.selectedWeek])

    // effect for scrolling the container to the current hour line
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = currentHourOffsetInPixels - 100; // 100px to ensure the line is not right at the top
        }
    }, [calendarHeight]);

    // initial calendarHeight based on the current window dimensions
    useEffect(() => {
        const updateDimensions = () => {
            const offset = window.innerHeight * params.calendarViewTopOffsetPercentage;
            setCalendarHeight(window.innerHeight * 2 - offset);
            // setCalendarHeight(window.innerHeight * 2 - headerHeight);

            setCalendarWidth(window.innerWidth * (1 - params.calendarViewLeftOffsetPercentage));
        };

        const updateCurrentHour = () => {
            const now = new Date();
            setCurrentDateTime(now)
        };

        updateDimensions();
        updateCurrentHour();

        const intervalId = setInterval(updateCurrentHour, 1000); // Update every minute

        window.addEventListener("resize", updateDimensions);

        return () => {
            window.removeEventListener("resize", updateDimensions);
            clearInterval(intervalId)
        }
    }, [params.screenHeight, params.screenWidth, params.calendarViewLeftOffsetPercentage]);

    const handleHourClick = (day: DayOfWeek, hour: number, minute: number) => {
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
        if (!dayEvents) return [];
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
            ref={scrollContainerRef}
            style={{
                height: `${(1 - params.calendarViewTopOffsetPercentage) * 100}vh`,
                // height: `${calendarHeight}px`,
                top: `${calendarTopOffsetInPixels}px`,
                left: `${params.calendarViewLeftOffsetPercentage * 100}vw`,
                position: "absolute",
                overflowY: "scroll",
                width: `${(1 - params.calendarViewLeftOffsetPercentage) * 100}vw`,
            }}
        >
            <div
                style={{
                    display: "flex",
                    position: "relative",
                    // height: "100vh",
                }}
            >
                {/* Current time line */}
                <CurrentHourLine
                    leftOffset={calendarLeftColumnHoursWidthInPixels}
                    position={headerHeight + currentHourOffsetInPixels}
                />

                <CurrentHourLine
                    leftOffset={(calendarWidth - calendarLeftColumnHoursWidthInPixels) / 7 + calendarLeftColumnHoursWidthInPixels}
                    position={headerHeight + currentHourOffsetInPixels}
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
                <div style={{ width: `${calendarLeftColumnHoursWidthInPixels}px`, position: "absolute" }}>
                    {Array.from({ length: 24 }).map((_, index) => (
                        <TimeLabel
                            key={index}
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
                    <div style={{
                        position: "relative",
                        height: `${calendarHeight + headerHeight}px`,
                    }}>

                        <div
                            style={{
                                height: `${headerHeight}px`,
                                position: "sticky",
                                top: 0,
                                width: `${calendarLeftColumnHoursWidthInPixels}px`,
                                borderBottom: `1px solid ${colors.gray2}`,
                                textAlign: "center",
                                backgroundColor: "white",
                                zIndex: 100,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            {/* <p style={{ fontSize: `1rem`, padding: 0, margin: 0 }}>Time</p> */}
                            <SyncLoader
                                color='black'
                                loading={isLoadingEvents}
                                size={5}
                            />
                        </div>
                    </div>

                    {daysOfWeek?.map((day) => {
                        const adjustedEvents = adjustEventPositions(
                            events.events[day.dayInUTC]
                        );

                        const isThisToday = Calendar.getCurrentDayNumber() === parseInt(day.dayNumberInMonth)

                        return (
                            <div
                                key={day.dayName}
                                style={{
                                    flex: 1,
                                    // borderLeft: `1px solid ${colors.gray2}`,
                                    position: "relative",
                                    height: `${calendarHeight + headerHeight
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
                                        borderBottom: `1px solid ${colors.gray2}`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <p style={{ fontSize: `1rem`, padding: 0, margin: 0, color: 'gray' }}>{day.dayName}</p>
                                    <div style={{
                                        borderRadius: isThisToday ? '1rem' : '0',
                                        backgroundColor: isThisToday ? 'red' : 'transparent',
                                        color: isThisToday ? 'white' : 'black',
                                        fontSize: `1rem`, padding: '0.1rem 0.6rem', margin: 0
                                    }}>
                                        {day.dayNumberInMonth}
                                    </div>
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

                                                    const minute = Math.max(0, Math.floor((clickY / slotHeight) * 60))

                                                    console.log(clickY)
                                                    // handleHourClick(
                                                    //     day,
                                                    //     hour,
                                                    //     minute
                                                    // );

                                                    params.openNewEventDialogHandler(day, hour, minute);
                                                }}
                                                style={{
                                                    height: `${slotHeight}px`,
                                                    borderLeft: `1px solid ${colors.gray2}`,
                                                    position: "absolute",
                                                    top: `${topOffset}px`,
                                                    width: `100%`,
                                                    // borderTop:
                                                    //     "1px solid gray",
                                                }}
                                                className="hover:bg-slate-50 bg-white"
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
    );
};

export default WeekView;
