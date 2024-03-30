import React, { useState, useEffect } from 'react';

import WeekView from '../../components/forPages/forWeekPage/WeekView/WeekView'
import LeftPanel from '../../components/forPages/forWeekPage/LeftPanel/LeftPanel';
import TopPanel from '../../components/forPages/forWeekPage/TopPanel/TopPanel';
import Calendar from '@/data/Calendar';
import SelectedWeek, { DayOfWeek } from '@/data/SelectedWeek';
import EventsManager, { Event, Events } from '@/data/EventsManager';
import NewEventDialogMaterial, { NewEventDialogOpenMode } from '@/components/NewEventDialogMaterial/NewEventDialogMaterial';
import CalendarSettings from '@/components/CalendarSettings/CalendarSettings';
import { SelectedMonth } from '@/data/SelectedMonth';
import withSetupValidation from '@/higherOrderComponents/withSetupValidation';
import { showError, showSuccess } from '@/components/AlertProvider/AlertProvider';
import persistenceManager from "@/data/PersistenceManager";

import networkManager from '@/Network/NetworkManager';
import { isSameWeek } from 'date-fns';

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

    const setSelectedWeekHandler = (newWeek: SelectedWeek): void => {
        if (isSameWeek(selectedWeek.startOfWeek, newWeek.startOfWeek)) return;
        setSelectedWeek(newWeek);
    }

    const [openedSettings, setOpenedSettings] = useState<boolean>(false);

    // event related [START]

    const [events, setEvents] = useState<Events>(new Events());
    const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(true)

    const [newEventDialogData, setNewEventDialogData] = useState<Event | null>(null)
    const [isCreatingNewEvent, setIsCreatingNewEvent] = useState<boolean>(false)
    const [eventDialogMode, setEventDialogMode] = useState<NewEventDialogOpenMode>(NewEventDialogOpenMode.CLOSED);

    // windows apps specific [START]
    const [windowsAppsCategoriesByDaysAndHoursPercentages, setWindowsAppsCategoriesByDaysAndHoursPercentages] = useState<Array<Array<object>> | null>(null);
    // windows apps specific [END]

    const openNewEventDialogHandler = (data: Event, dialogMode: NewEventDialogOpenMode) => {
        setNewEventDialogData(data);
        setEventDialogMode(dialogMode);
    }

    const closeEventDialogHandler = () => {
        setNewEventDialogData(null);
    }

    const displayEvents = (eventsData): Events => {
        const eventsResult = new Events()
        for (let i = 0; i < 7; ++i) {
            eventsResult.events[selectedWeek.getDayInThisWeekAccordingToIndexStartingFromMonday(i).toISOString()] = []
        }
        for (let j = 0; j < eventsData.length; ++j) {
            const current = eventsData[j];

            if (selectedWeek.isGivenDateInThisWeek(current.payload.startTime))
                eventsResult.events[current.getDayOfThisEvent().toISOString()].push(current)
        }
        return eventsResult;
    }

    const getAllEventsUsingStandardAccessToken = (selectedWeek: SelectedWeek) => {
        console.log('fetching using access token to profile');
        eventsManager.getEventsForSelectedWeek(selectedWeek)
            .then((eventsData: Events) => {
                setEvents(displayEvents(eventsData.events));
                setIsLoadingEvents(false)
            })
            .catch(errMessage => {
                showError(errMessage);
            })
            .finally(() => {
                setIsLoadingEvents(false);
            });
    }

    const getSpecificEventsUsingCalendarViewInstance = (selectedWeek: SelectedWeek) => {
        const viewInstanceAccessTokenForCalendarEventsFetching = persistenceManager.getViewInstanceAccessTokenForCalendarEventsFetching();
        if (viewInstanceAccessTokenForCalendarEventsFetching == null)
            return showError("Your app does not have token saved for executing remote view instance");

        networkManager.executeViewInstance(viewInstanceAccessTokenForCalendarEventsFetching, { selectedWeek: selectedWeek.convertSelectedWeekToSimpleISODatesObject() })
            .then(result => {
                if (result.code != 200) {
                    return showError(result.message);
                }

                // console.log(result);
                const eventsResponse = result.filteredEvents.map(event => Event.convertEventReceivedFromServerToThisEvent(event))
                setEvents(displayEvents(eventsResponse))
                setIsLoadingEvents(false)
            })
            .catch(err => {
                showError('Something went wrong exeucting view instance for getting events');
                console.log(err);
            })
            .finally(() => {
                setIsLoadingEvents(false);
            })
    }

    const getWindowsAppsForSelectedWeek = (selectedWeek: SelectedWeek) => {
        const viewInstanceAccessTokenForWindowsApps = persistenceManager.getViewInstanceAccessTokenForWindowsAppsUniqueNamesList();
        if (viewInstanceAccessTokenForWindowsApps == null)
            return showError("Your app does not have token saved for executing remote view instance about windows apps");

        networkManager.executeViewInstance(viewInstanceAccessTokenForWindowsApps, { getAppsForSpecificDay: true, selectedWeek: selectedWeek.convertSelectedWeekToSimpleISODatesObject(), appsWithAssignedCategories: persistenceManager.getAppsWithAssignedCategories() })
            .then(result => {
                if (result.code != 200) {
                    return showError(result.message);
                }
                setWindowsAppsCategoriesByDaysAndHoursPercentages(result.eventsByDayAndHour);
                // console.log(result);
            })
            .catch(err => {
                console.log(err);
            })
    }

    const getAllEventsForSelectedWeek = (selectedWeek: SelectedWeek) => {
        if (persistenceManager.getIsViewInstanceUsedForCalendarFetching())
            getSpecificEventsUsingCalendarViewInstance(selectedWeek);      
        else
            getAllEventsUsingStandardAccessToken(selectedWeek);  

        if (persistenceManager.getAreWindowsOpenedAppsShown()) {
            setWindowsAppsCategoriesByDaysAndHoursPercentages(null);
            getWindowsAppsForSelectedWeek(selectedWeek);
        }
    }

    const createNewEventHandler = (newEvent: Event): Promise<void> => {
        return new Promise<void>((res, rej) => {
            if (isCreatingNewEvent) return;

            setIsCreatingNewEvent(true);

            networkManager.createNewEvent(newEvent)
                .then((response => {
                    console.log(response);
                    // if the user is currently looking at the week in which they create new newEvent - display that newEvent
                    if (selectedWeek.isGivenDateInThisWeek(newEvent.payload.startTime)) {
                        setEvents((events: Events) => {
                            events.events[newEvent.getDayOfThisEvent().toISOString()] = [
                                ...events.events[newEvent.getDayOfThisEvent().toISOString()],
                                response.newEvent
                            ]
                            return events;
                        })
                    }
                    showSuccess(response.message);
                    res();
                }))
                .catch(err => {
                    showError(err);
                })
                .finally(() => {
                    setIsCreatingNewEvent(false)
                })
        })
    }

    const modifyEventHandler = (event: Event) => {
        networkManager.modifyEvent(event)
            .then(res => {
                showSuccess(res.message);
                closeEventDialogHandler();
                getAllEventsForSelectedWeek(selectedWeek);
            })
            .catch(err => {
                showSuccess('Unable to update event');
                console.log(err);
            })
    }

    const deleteEventHandler = (event: Event) => {
        networkManager.deleteEvent(event)
            .then(res => {
                showSuccess(res.message);
                getAllEventsForSelectedWeek(selectedWeek);
            })
            .catch(err => {
                showSuccess('Unable to delete event');
                console.log(err);
            })
    }

    useEffect(() => {
        console.log("Loading for: ", selectedWeek.startOfWeek)

        setEvents(new Events())
        setIsLoadingEvents(true);

        getAllEventsForSelectedWeek(selectedWeek);
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
                modifyEventHandler={modifyEventHandler}
                deleteEventHandler={deleteEventHandler}
                isCreatingNewEvent={isCreatingNewEvent}
                mode={eventDialogMode}
            />
            <CalendarSettings open={openedSettings} handleClose={() => setOpenedSettings(false)} />

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
                    setSelectedWeek={setSelectedWeekHandler}
                    openSettings={() => setOpenedSettings(true)}
                />
            </div>

            <div style={{
                height: `${(1 - calendarViewTopOffsetPercentage) * 100}vh`,
                position: "absolute",
                top: `${calendarViewTopOffsetPercentage * 100}vh`,
                width: `${(calendarViewLeftOffsetPercentage) * 100}vw`,
                zIndex: 2,
            }}>
                <LeftPanel
                    calendarHeaderHeightInPixels={calendarHeaderHeightInPixels}
                    selectedWeek={selectedWeek}
                    selectedMonth={selectedMonth}
                    setSelectedWeek={setSelectedWeekHandler}
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
                deleteEventHandler={deleteEventHandler}
                windowsAppsCategoriesByDaysAndHoursPercentages={windowsAppsCategoriesByDaysAndHoursPercentages}
            />
        </div>
    )
}

export default withSetupValidation(WeekPage);