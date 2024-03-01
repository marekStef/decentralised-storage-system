import React, {useState, useEffect} from 'react';

import WeekView from './WeekView/WeekView'
import LeftPanel from './LeftPanel/LeftPanel';
import TopPanel from './TopPanel/TopPanel';
import Calendar from '@/data/Calendar';
import SelectedWeek, { DayOfWeek } from '@/data/SelectedWeek';
import NewEventDialog, { NewEventDialogData } from '@/components/NewEventDialog/NewEventDialog';
import EventsManager, { Events } from '@/data/EventsManager';

const eventsManager = new EventsManager();

const Index = () => {
    const [screenHeight, setScreenHeight] = useState(0);
    const [screenWidth, setScreenWidth] = useState(0);

    const calendarViewTopOffsetPercentage = 0.1;
    const calendarViewLeftOffsetPercentage = 0.2;
    const calendarViewRightOffsetPercentage = 0.01;

    const [selectedWeek, setSelectedWeek] = useState<SelectedWeek>(new SelectedWeek())
    const [newEventDialogData, setNewEventDialogData] = useState<NewEventDialogData | null>(null)

    const openNewEventDialogHandler = (day: DayOfWeek, hour: number, minute: number) => {
        setNewEventDialogData({
            day,
            hour,
            minute
        });
    }

    // event related [START]

    const [events, setEvents] = useState<Events>(new Events());
    const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(true)

    useEffect(() => {
        console.log("Loading for: ", selectedWeek.startOfWeek)

        setEvents(new Events())
        setIsLoadingEvents(true);
        
        eventsManager.getEventsForSelectedWeek(selectedWeek)
            .then(events => {
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
            <NewEventDialog data={newEventDialogData} onClose={() => setNewEventDialogData(null)}/>
            <div
                style={{
                    height: `${calendarViewTopOffsetPercentage * 100}vh`,
                    position: "absolute",
                    top: 0,
                    width: "100%",
                    zIndex: 2,
                }}
            >
                <TopPanel selectedWeek={selectedWeek} setSelectedWeek={setSelectedWeek}/>
            </div>

            <div style={{
                    height: `${( 1 - calendarViewTopOffsetPercentage) * 100}vh`,
                    position: "absolute",
                    top: `${calendarViewTopOffsetPercentage * 100}vh`,
                    width: `${(calendarViewLeftOffsetPercentage) * 100}vw`,
                    zIndex: 2,
                }}>
                    <LeftPanel />
            </div>
            <WeekView
                screenHeight={screenHeight}
                screenWidth={screenWidth}
                calendarViewTopOffsetPercentage={calendarViewTopOffsetPercentage}
                calendarViewLeftOffsetPercentage={calendarViewLeftOffsetPercentage}
                calendarViewRightOffsetPercentage={calendarViewRightOffsetPercentage}
                selectedWeek={selectedWeek}
                openNewEventDialogHandler={openNewEventDialogHandler}
                isLoadingEvents={isLoadingEvents}
                events={events}
            />
            </div>
    )
}

export default Index;