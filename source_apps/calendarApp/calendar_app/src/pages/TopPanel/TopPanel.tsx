import React from 'react';
import { colors } from '@/constants/colors';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';

import WeekNavigationButtons from './components/WeekNavigationButtons';
import SelectedWeek from '@/data/SelectedWeek';
import Calendar from '@/data/Calendar';

interface TopPanelParams {
    selectedWeek: SelectedWeek,
    setSelectedWeek: (week: SelectedWeek | ((prevWeek: SelectedWeek) => SelectedWeek)) => void;
}

const TopPanel: React.FC<TopPanelParams> = (params) => {
    return (
        <div style={{width: '100%', height: '100%', padding: '1rem', backgroundColor: 'white'}}>
            <div
                style={{
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <h1
                    style={{
                        fontWeight: 'bold',
                        fontSize: '1.4rem'
                    }}
                >CalendPro</h1>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    <h1
                        style={{padding: '0.5rem'}}
                    >{Calendar.getReadableDateWithoutTime(params.selectedWeek.startOfWeek)}-{Calendar.getReadableDateWithoutTime(params.selectedWeek.endOfWeek)}</h1>
                    <WeekNavigationButtons setSelectedWeek={params.setSelectedWeek} />
                </div>

            </div>
        </div>
    )
}

export default TopPanel;