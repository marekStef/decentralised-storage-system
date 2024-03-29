import { colors } from '@/constants/colors';
import React from 'react';
import MonthMinimap from './components/MonthMinimap/MonthMinimap';
import SelectedWeek from '@/data/SelectedWeek';
import { SelectedMonth } from '@/data/SelectedMonth';
import persistenceManager from '@/data/PersistenceManager';

import SquareButton from "@/components/SquareButton/SquareButton";
import { IoAppsOutline } from 'react-icons/io5';

interface LeftPanelParams {
    calendarHeaderHeightInPixels: number,
    selectedWeek: SelectedWeek,
    selectedMonth: SelectedMonth,
    setSelectedWeek: (week: SelectedWeek) => void;
    setSelectedMonth: (week: SelectedMonth | ((prevMonth: SelectedMonth) => SelectedMonth)) => void;
}

const LeftPanel: React.FC<LeftPanelParams> = params => {
    const isShowingWindowsAppsOn = persistenceManager.getAreWindowsOpenedAppsShown();

    return (
        <div style={{marginTop: `${params.calendarHeaderHeightInPixels}px`, backgroundColor: 'white', padding: "0 1rem"}}>
            <MonthMinimap 
                selectedMonth={params.selectedMonth} 
                selectedWeek={params.selectedWeek} 
                setSelectedWeek={params.setSelectedWeek} 
                setSelectedMonth={params.setSelectedMonth}
            />

            {isShowingWindowsAppsOn && (
                <>
                    <SquareButton style={{marginTop: '1rem', width: '100%'}} href="/windowsAppsSettings">
                        <IoAppsOutline size={24} />{" "}
                        <p className="ml-4">
                            Windows Opened Apps
                        </p>
                    </SquareButton>
                </>
            )}
        </div>
    )
}

export default LeftPanel;