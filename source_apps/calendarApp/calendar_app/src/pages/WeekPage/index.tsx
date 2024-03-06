import React, {useState, useEffect} from 'react';

import WeekView from './WeekView/WeekView'
import LeftPanel from './LeftPanel/LeftPanel';
import TopPanel from './TopPanel/TopPanel';
import Calendar from '@/data/Calendar';
import SelectedWeek, { DayOfWeek } from '@/data/SelectedWeek';
import EventsManager, { Event, Events } from '@/data/EventsManager';
import NewEventDialogMaterial, { NewEventDialogOpenMode } from '@/components/NewEventDialogMaterial/NewEventDialogMaterial';
import CalendarSettings from '@/components/CalendarSettings/CalendarSettings';
import { SelectedMonth } from '@/data/SelectedMonth';
import withSetupValidation from '@/higherOrderComponents/withSetupValidation';

const eventsManager = new EventsManager();

const calendarViewTopOffsetPercentage = 0.1;
const calendarViewLeftOffsetPercentage = 0.2;
const calendarViewRightOffsetPercentage = 0.01;
const calendarHeaderHeightInPixels = 60;

const WeekPage = () => {
    const [screenHeight, setScreenHeight] = useState(0);
    const [screenWidth, setScreenWidth] = useState(0);

    const [selectedWeek, setSelectedWeek] = useState<SelectedWeek>(new SelectedWeek())
    const [selectedMonth, setSelectedMonth] = useState<SelectedMonth>(new SelectedMonth())

    const [openedSettings, setOpenedSettings] = useState<boolean>(false);

    // event related [START]

    const [events, setEvents] = useState<Events>(new Events());
    const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(true)

    const [newEventDialogData, setNewEventDialogData] = useState<Event | null>(null)
    const [isCreatingNewEvent, setIsCreatingNewEvent] = useState<boolean>(false)
    const [eventDialogMode, setEventDialogMode] = useState<NewEventDialogOpenMode>(NewEventDialogOpenMode.CLOSED);

    const openNewEventDialogHandler = (data: Event, dialogMode: NewEventDialogOpenMode) => {
        setNewEventDialogData(data);
        setEventDialogMode(dialogMode);
    }

    const createNewEventHandler = (newEvent: Event): Promise<void> => {
        return new Promise<void>((res, rej) => {
            if (isCreatingNewEvent) return;

            setIsCreatingNewEvent(true);
    
            eventsManager.createNewEvent(newEvent)
                .then((response => {
                    // if the user is currently looking at the week in which they create new newEvent - display that newEvent
                    if (selectedWeek.isGivenDateInThisWeek(newEvent.startTime)) {
                        setEvents((events: Events) => {
                            events.events[newEvent.getDayOfThisEvent().toISOString()] = [
                                ...events.events[newEvent.getDayOfThisEvent().toISOString()],
                                newEvent
                            ]
                            return events;
                        })
                    }
                    res();
                }))
                .catch(err => {
                    rej()
                })
                .finally(() => {
                    setIsCreatingNewEvent(false)
                })
        })
    }

    useEffect(() => {
        console.log("Loading for: ", selectedWeek.startOfWeek)

        setEvents(new Events())
        setIsLoadingEvents(true);
        
        eventsManager.getEventsForSelectedWeek(selectedWeek)
            .then((events: Events) => {
                setEvents(events)
                setIsLoadingEvents(false)
            })
    }, [selectedWeek])

    useEffect(() => {
        const updateDimensions = () => {
            setScreenHeight(window.innerHeight);
            setScreenWidth(window.innerWidth);
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);

        setSelectedMonth(new SelectedMonth())
    }, []);

    // event related [END]

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                width: "99vw",
                paddingTop: `${calendarViewTopOffsetPercentage}vh`,
            }}
        >
            {/* <NewEventDialog data={newEventDialogData} onClose={() => setNewEventDialogData(null)}/> */}

            <NewEventDialogMaterial 
                handleClose={() => setNewEventDialogData(null)} 
                newEventDialogData={newEventDialogData}
                createNewEventHandler={createNewEventHandler}
                isCreatingNewEvent={isCreatingNewEvent}
                mode={eventDialogMode}
            />
            <CalendarSettings open={openedSettings} handleClose={() => setOpenedSettings(false)}/>

            <div
                style={{
                    height: `${calendarViewTopOffsetPercentage * 100}vh`,
                    position: "absolute",
                    top: 0,
                    width: "100%",
                    zIndex: 2,
                }}
            >
                <TopPanel 
                    selectedWeek={selectedWeek} 
                    setSelectedWeek={setSelectedWeek} 
                    openSettings={() => setOpenedSettings(true)} 
                />
            </div>

            <div style={{
                    height: `${( 1 - calendarViewTopOffsetPercentage) * 100}vh`,
                    position: "absolute",
                    top: `${calendarViewTopOffsetPercentage * 100}vh`,
                    width: `${(calendarViewLeftOffsetPercentage) * 100}vw`,
                    zIndex: 2,
                }}>
                    <LeftPanel 
                        calendarHeaderHeightInPixels={calendarHeaderHeightInPixels}
                        selectedWeek={selectedWeek}
                        selectedMonth={selectedMonth}
                        setSelectedWeek={setSelectedWeek} 
                        setSelectedMonth={setSelectedMonth}
                    />
            </div>
            <WeekView
                screenHeight={screenHeight}
                screenWidth={screenWidth}
                calendarViewTopOffsetPercentage={calendarViewTopOffsetPercentage}
                calendarViewLeftOffsetPercentage={calendarViewLeftOffsetPercentage}
                calendarViewRightOffsetPercentage={calendarViewRightOffsetPercentage}
                calendarHeaderHeightInPixels={calendarHeaderHeightInPixels}
                selectedWeek={selectedWeek}
                openNewEventDialogHandler={openNewEventDialogHandler}
                isLoadingEvents={isLoadingEvents}
                events={events}
            />
            </div>
    )
}

export default withSetupValidation(WeekPage);