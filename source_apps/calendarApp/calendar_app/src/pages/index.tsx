import React, {useState, useEffect} from 'react';

import WeekView from './WeekView/WeekView'
import LeftPanel from './LeftPanel/LeftPanel';
import TopPanel from './TopPanel/TopPanel';
import Calendar from '@/data/Calendar';
import SelectedWeek from '@/data/SelectedWeek';

const Index = () => {
    const [screenHeight, setScreenHeight] = useState(0);
    const [screenWidth, setScreenWidth] = useState(0);

    const calendarViewTopOffsetPercentage = 0.1;
    const calendarViewLeftOffsetPercentage = 0.2;

    const [selectedWeek, setSelectedWeek] = useState<SelectedWeek>(new SelectedWeek())

    useEffect(() => {
        const updateDimensions = () => {
            setScreenHeight(window.innerHeight);
            setScreenWidth(window.innerWidth);
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
    }, []);

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
                    width: `${calendarViewLeftOffsetPercentage * 100}vw`,
                    zIndex: 2,
                }}>
                    <LeftPanel />
            </div>
            <WeekView
                screenHeight={screenHeight}
                screenWidth={screenWidth}
                calendarViewTopOffsetPercentage={calendarViewTopOffsetPercentage}
                calendarViewLeftOffsetPercentage={calendarViewLeftOffsetPercentage}
                selectedWeek={selectedWeek}
            />
            </div>
    )
}

export default Index;