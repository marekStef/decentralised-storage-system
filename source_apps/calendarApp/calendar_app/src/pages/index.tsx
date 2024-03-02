import React, {useState, useEffect} from 'react';

import WeekView from './WeekView/WeekView'
import LeftPanel from './LeftPanel/LeftPanel';
import TopPanel from './TopPanel/TopPanel';
import Calendar from '@/data/Calendar';
import SelectedWeek, { DayOfWeek } from '@/data/SelectedWeek';
import EventsManager, { Events } from '@/data/EventsManager';
import NewEventDialogMaterial, { NewEventDialogData } from '@/components/NewEventDialogMaterial/NewEventDialogMaterial';
import CalendarSettings from '@/components/CalendarSettings/CalendarSettings';
import { SelectedMonth } from '@/data/SelectedMonth';

const eventsManager = new EventsManager();

const calendarViewTopOffsetPercentage = 0.1;
const calendarViewLeftOffsetPercentage = 0.2;
const calendarViewRightOffsetPercentage = 0.01;
const calendarHeaderHeightInPixels = 60;

const Index = () => {
    const [screenHeight, setScreenHeight] = useState(0);
    const [screenWidth, setScreenWidth] = useState(0);

    const [selectedWeek, setSelectedWeek] = useState<SelectedWeek>(new SelectedWeek())
    const [selectedMonth, setSelectedMonth] = useState<SelectedMonth>(new SelectedMonth())

    const [newEventDialogData, setNewEventDialogData] = useState<NewEventDialogData | null>(null)
    const [openedSettings, setOpenedSettings] = useState<boolean>(false);

    const openNewEventDialogHandler = (data: NewEventDialogData) => {
        setNewEventDialogData(data);
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

            <NewEventDialogMaterial open={newEventDialogData} handleClose={() => setNewEventDialogData(null)} newEventDialogData={newEventDialogData}/>
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

export default Index;