import { colors } from '@/constants/colors';
import React from 'react';
import MonthMinimap from './components/MonthMinimap/MonthMinimap';
import SelectedWeek from '@/data/SelectedWeek';
import { SelectedMonth } from '@/data/SelectedMonth';

interface LeftPanelParams {
    calendarHeaderHeightInPixels: number,
    selectedWeek: SelectedWeek,
    selectedMonth: SelectedMonth,
    setSelectedWeek: (week: SelectedWeek) => void;
    setSelectedMonth: (week: SelectedMonth | ((prevMonth: SelectedMonth) => SelectedMonth)) => void;
}

const LeftPanel: React.FC<LeftPanelParams> = params => {
    return (
        <div style={{marginTop: `${params.calendarHeaderHeightInPixels}px`, backgroundColor: 'white', padding: "0 1rem"}}>
            <MonthMinimap 
                selectedMonth={params.selectedMonth} 
                selectedWeek={params.selectedWeek} 
                setSelectedWeek={params.setSelectedWeek} 
                setSelectedMonth={params.setSelectedMonth}
            />
        </div>
    )
}

export default LeftPanel;