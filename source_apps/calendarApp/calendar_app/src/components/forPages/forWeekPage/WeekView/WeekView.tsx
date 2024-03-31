import React, { useState, useEffect, useRef } from "react";
import "./index.css";
import { colors } from "@/constants/colors";
import Calendar from "@/data/Calendar";

import EventUI from "./components/Event/Event";
import { Event } from "@/data/EventsManager";
import HourLine from "./components/HourLines/HourLine";
import CurrentHourLine from "./components/HourLines/CurrentHourLine";
import TimeLabel from "./components/TimeLabel/TimeLabel";

import SelectedWeek, { DayOfWeek } from "@/data/SelectedWeek";
import EventsManager, { Events } from "@/data/EventsManager";
import { SyncLoader } from "react-spinners";
import { timeConstants } from "@/constants/timeConstants";
import DraggableNewEventPreview from "./components/DraggableNewEventPreview/DraggableNewEventPreview";
import { isToday } from "date-fns";
import useScrollbarWidth from "@/customHooks/useScrollbarWidth";
import { NewEventDialogOpenMode } from "@/components/NewEventDialogMaterial/NewEventDialogMaterial";
import HourSlots from "./components/HourSlots/HourSlots";
import WeekDayHeader from "./components/WeekDayHeader/WeekDayHeader";

import dynamic from 'next/dynamic';

const LocationModalWithNoSSR = dynamic(
  () => import('@/components/LocationModal/LocationModal'),
  { ssr: false }
);

interface WeekViewParams {
    screenHeight: number,
    screenWidth: number,
    calendarViewTopOffsetPercentage: number,
    calendarViewLeftOffsetPercentage: number,
    calendarViewRightOffsetPercentage: number,
    calendarHeaderHeightInPixels: number,
    selectedWeek: SelectedWeek,
    openNewEventDialogHandler: (data: Event, dialogMode: NewEventDialogOpenMode) => void,
    deleteEventHandler: (newEvent: Event) => void,
    isLoadingEvents: boolean,
    events: Events,
    windowsAppsCategoriesByDaysAndHoursPercentages: Array<Array<object>> | null
}

const WeekView: React.FC<WeekViewParams> = (params) => {
    const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date())
    const [currentTimeHorizontalLineOffset, setCurrentTimeHorizontalLineOffset] = useState<number>(0)

    // console.log(Calendar.getCurrentDayName())
    // console.log(Calendar.getWeekDaysWithDates());
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // console.log(Calendar.getFormatDateInISO())

    const [daysOfWeek, setDaysOfWeek] = useState<Array<DayOfWeek> | null>(null)

    // The height of the header with day names
    const calendarLeftColumnHoursWidthInPixels = 50
    // Total height of the calendar (excluding the header)
    const [calendarHeight, setCalendarHeight] = useState(0);
    const [calendarWidth, setCalendarWidth] = useState(0);

    const calendarTopOffsetInPixels = params.screenHeight * params.calendarViewTopOffsetPercentage;
    const calendarLeftOffsetInPixels = params.screenWidth * params.calendarViewLeftOffsetPercentage;

    const currentHourInSeconds = currentDateTime.getHours() * 60 * 60 + currentDateTime.getMinutes() * 60 + currentDateTime.getSeconds()

    const calendarHeightWithoutHeader = calendarHeight - params.calendarHeaderHeightInPixels;

    const currentHourOffsetInPixels = (calendarHeightWithoutHeader / timeConstants.NUMBER_OF_SECONDS_IN_DAY) * currentHourInSeconds

    const [weekDaysWithDatesForSelectedWeek, setWeekDaysWithDatesForSelectedWeek] = useState<Array<DayOfWeek> | null>(null);

    // android locations specific [start]
    const [locationsModalData, setLocationsModalData] = useState<DayOfWeek | null>(null);
    const openLocationsModal = (day: DayOfWeek) => {
        setLocationsModalData(day);
    }
    // android locations specific [end]

    useEffect(() => {
        setWeekDaysWithDatesForSelectedWeek(params.selectedWeek.getWeekDaysWithDates())
    }, [params.selectedWeek])

    // effect for scrolling the container to the current hour line
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = currentHourOffsetInPixels - 100; // 100px to ensure the line is not right at the top
        }
    }, [calendarHeight]);

    const scrollbarWidth = useScrollbarWidth(scrollContainerRef);

    // initial calendarHeight based on the current window dimensions
    useEffect(() => {
        const updateDimensions = () => {
            const offset = window.innerHeight * params.calendarViewTopOffsetPercentage;
            setCalendarHeight(window.innerHeight * 2 - offset);
            // setCalendarHeight(window.innerHeight * 2 - params.calendarHeaderHeightInPixels);

            setCalendarWidth(window.innerWidth * (1 - params.calendarViewLeftOffsetPercentage - params.calendarViewRightOffsetPercentage));
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
    }, [params.screenHeight, params.screenWidth, params.calendarViewLeftOffsetPercentage, params.calendarViewRightOffsetPercentage]);

    const handleHourClick = (day: DayOfWeek, hour: number, minute: number) => {
        console.log(`Hour clicked: ${day}, ${hour}:${minute}`);
        alert(`Hour clicked: ${day}, ${hour}:${minute}`);
    };

    // Function to calculate top offset based on event's start time
    const calculateTopOffset = (startTime: Date) => {
        // const [hours, minutes] = startTime
        //     .split(":")
        //     .map((num) => parseInt(num, 10));
        const hourHeight = calendarHeight / 24;
        return params.calendarHeaderHeightInPixels + startTime.getHours() * hourHeight + (startTime.getMinutes() * hourHeight) / 60;
    };

    const adjustEventPositions = (dayEvents: Event[]) => {
        if (!dayEvents) return [];
        // Converting event times to minutes for comparison
        const eventsWithPosition = dayEvents.map((event) => ({
            ...event,
            startInMinutes:
                event.payload.startTime.getHours() * 60 +
                event.payload.startTime.getMinutes(),
            endInMinutes:
                event.payload.endTime.getHours() * 60 + event.payload.endTime.getMinutes(),
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

    const slotWidth = Math.floor((calendarWidth - calendarLeftColumnHoursWidthInPixels - scrollbarWidth) / 7);

    return (
        <div
            ref={scrollContainerRef}
            style={{
                height: `${(1 - params.calendarViewTopOffsetPercentage) * 100}vh`,
                // height: `${calendarHeight}px`,
                top: `${calendarTopOffsetInPixels}px`,
                left: `${calendarLeftOffsetInPixels}px`,
                position: "absolute",
                overflowY: "scroll",
                width: `${calendarWidth}px`,
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
                    position={params.calendarHeaderHeightInPixels + currentHourOffsetInPixels}
                    heightInPixels={2}
                />

                <LocationModalWithNoSSR // it needs to be no ssr as the library tried to access window on the server - which of course does not work as the window variable is in browser only
                    open={locationsModalData != null}
                    handleClose={() => setLocationsModalData(null)}
                    selectedDay={locationsModalData}
                />

                <DraggableNewEventPreview 
                    calendarTopOffsetInPixels={calendarTopOffsetInPixels} 
                    headerHeight={params.calendarHeaderHeightInPixels}
                    calendarHeight={calendarHeight}
                    scrollContainerRef={scrollContainerRef} 
                    calendarLeftOffsetInPixels={calendarLeftOffsetInPixels}
                    hourSlotWidth={slotWidth}
                    hourSlotHeight={calendarHeight / 24}
                    calendarWidth={calendarWidth}
                    calendarLeftColumnHoursWidthInPixels={calendarLeftColumnHoursWidthInPixels}
                    openNewEventDialogHandler={params.openNewEventDialogHandler}
                    selectedWeek={params.selectedWeek}
                />

                {/* Hour Lines */}
                {Array.from({ length: 24 }).map((_, index) => (
                    <HourLine
                        key={index}
                        position={
                            params.calendarHeaderHeightInPixels + index * (calendarHeight / 24)
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
                            headerHeight={params.calendarHeaderHeightInPixels}
                            calendarLeftColumnHoursWidthInPixels={calendarLeftColumnHoursWidthInPixels}
                        />
                    ))}
                </div>

                {/* Day Columns
            <div style={{ display: "flex", flex: 1, marginLeft: "50px" }}>
                {daysOfWeek.map((day) => (
                    <DayColumn
                        key={day}
                        day={day}
                        headerHeight={params.calendarHeaderHeightInPixels}
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
                            height: `${params.calendarHeaderHeightInPixels}px`,
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                height: `${params.calendarHeaderHeightInPixels}px`,
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
                        height: `${calendarHeight + params.calendarHeaderHeightInPixels}px`,
                    }}>

                        <div
                            style={{
                                height: `${params.calendarHeaderHeightInPixels}px`,
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
                            {/* <p style={{ fontSize: `1rem`, padding: 0, margin: 0 }}>{slotWidth}</p> */}
                            <SyncLoader
                                color={colors.gray2}
                                loading={params.isLoadingEvents}
                                size={5}
                            />
                        </div>
                    </div>

                    {weekDaysWithDatesForSelectedWeek?.map((day, dayIndex) => {
                        const adjustedEvents = adjustEventPositions(
                            params.events.events[day.dayInUTC]
                        );

                        return (
                            <div
                                key={day.dayName}
                                style={{
                                    // flex: 1,
                                    width: `${slotWidth}px`,
                                    // borderLeft: `1px solid ${colors.gray2}`,
                                    position: "relative",
                                    height: `${calendarHeight + params.calendarHeaderHeightInPixels}px`,
                                }}
                            >
                                <WeekDayHeader 
                                    calendarHeaderHeightInPixels={params.calendarHeaderHeightInPixels}
                                    day={day}
                                    openLocationsModal={openLocationsModal}
                                />

                                {/* Hour Slots */}
                                <HourSlots 
                                    calendarHeight={calendarHeight} 
                                    day={day} 
                                    openNewEventDialogHandler={params.openNewEventDialogHandler} 
                                    calendarHeaderHeightInPixels={params.calendarHeaderHeightInPixels}
                                    windowsAppsCategoriesByHours={
                                        (params.windowsAppsCategoriesByDaysAndHoursPercentages != null && dayIndex < params.windowsAppsCategoriesByDaysAndHoursPercentages.length)
                                        ? params.windowsAppsCategoriesByDaysAndHoursPercentages[dayIndex] 
                                        : null
                                    }
                                />

                                {/* Events */}

                                {adjustedEvents.map((event: Event, index: number) => (
                                    <EventUI
                                        key={event.id}
                                        topOffset={calculateTopOffset(
                                            event.payload.startTime
                                        )}
                                        leftOffset={event.leftOffset}
                                        width={event.width}
                                        calendarHeight={calendarHeight}
                                        openNewEventDialogHandler={params.openNewEventDialogHandler}
                                        event={event}
                                        deleteEventHandler={params.deleteEventHandler}
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
