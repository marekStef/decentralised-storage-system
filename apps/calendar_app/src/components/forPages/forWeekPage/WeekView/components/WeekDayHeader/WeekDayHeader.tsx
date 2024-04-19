import React, { useState } from 'react';
import { colors } from '@/constants/colors';
import { DayOfWeek } from '@/data/SelectedWeek';
import { isToday } from 'date-fns';
import { IoLocationOutline } from 'react-icons/io5';
import SquareButton from '@/components/SquareButton/SquareButton';
import persistenceManager from '@/data/PersistenceManager';

interface WeekDayHeaderParams {
    calendarHeaderHeightInPixels: number,
    day: DayOfWeek,
    openLocationsModal: (dayOfWeek: DayOfWeek) => void
}

const WeekDayHeader: React.FC<WeekDayHeaderParams> = (params) => {
    const isThisToday = isToday(params.day.date);
    const [isHovered, setIsHovered] = useState(false);
    const shouldLocationBeVisible = persistenceManager.getAreAndroidLocationsShown();

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                height: `${params.calendarHeaderHeightInPixels}px`,
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
                justifyContent: 'center',
            }}
        >
            <p style={{ fontSize: `1rem`, padding: 0, margin: 0, color: 'gray' }}>
                {params.day.dayName}
            </p>

            <div style={{
                borderRadius: isThisToday ? '1rem' : '0',
                backgroundColor: isThisToday ? 'red' : 'transparent',
                color: isThisToday ? 'white' : 'black',
                fontSize: `1rem`, padding: '0.1rem 0.6rem', margin: 0
            }}>
                {params.day.dayNumberInMonth}
            </div>

            {shouldLocationBeVisible && isHovered && (
                <SquareButton 
                    onClick={() => params.openLocationsModal(params.day)}
                    style={{
                        position: 'absolute',
                        top: '0rem',
                        right: '0rem',
                        color: 'gray'
                    }}
                >
                    <IoLocationOutline 
                        
                    />
                </SquareButton>
            )}
        </div>
    );
};

export default WeekDayHeader;
