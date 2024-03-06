import React, {useState} from 'react';
import { format, startOfMonth, endOfMonth, addDays, subDays, eachDayOfInterval, isSameMonth, isSameWeek, isWithinInterval, isToday, endOfWeek, startOfWeek, isSameDay, addMonths } from 'date-fns';
import { colors } from '@mui/material';
import SelectedWeek from '@/data/SelectedWeek';
import { SelectedMonth } from '@/data/SelectedMonth';
import SquareButton from '@/components/SquareButton/SquareButton';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';

interface MonthMinimapParams {
    selectedWeek: SelectedWeek,
    selectedMonth: SelectedMonth,
    setSelectedWeek: (week: SelectedWeek | ((prevWeek: SelectedWeek) => SelectedWeek)) => void;
    setSelectedMonth: (week: SelectedMonth | ((prevMonth: SelectedMonth) => SelectedMonth)) => void;
}

const MonthMinimap : React.FC<MonthMinimapParams> = params => {
  const startDate = startOfMonth(new Date(params.selectedMonth.year, params.selectedMonth.monthIndex));
  const endDate = endOfMonth(new Date(params.selectedMonth.year, params.selectedMonth.monthIndex));

  const [selectedDayInMinimap, setSelectedDayInMinimap] = useState<Date | null>();

  // to include 7 days before and after the selected month
  const extendedStartDate = startOfWeek(startDate, {weekStartsOn: 1});
  const extendedEndDate = addDays(endDate, 7);

  const daysToDisplay = eachDayOfInterval({
    start: extendedStartDate,
    end: extendedEndDate,
  });

  const setNewWeekHandler = (day: Date) : void => {
    setSelectedDayInMinimap(day);

    const newWeek = new SelectedWeek(startOfWeek(day, {weekStartsOn: 1}), endOfWeek(day, { weekStartsOn: 1 }));
    params.setSelectedWeek(newWeek)
  }

  return (
    <div>
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '1rem'
            }}
        >
            <h3 style={{padding: 0}}>{format(startDate, 'MMMM')} {format(startDate, 'yyyy')}</h3>

            <div
                style={{
                    display: 'flex'
                }}
            >
                <SquareButton onClick={() => params.setSelectedMonth(monthDate => monthDate.getPrevMonth())} style={{marginRight: '1rem'}}>
                    <IoChevronBackOutline size={16} />{" "}
                </SquareButton>

                <SquareButton onClick={() => params.setSelectedMonth(monthDate => monthDate.getNextMonth())}>
                    <IoChevronForwardOutline size={16} />{" "}
                </SquareButton>

            </div>
        </div>


        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(20px, 1fr))', gap: '2px' }}>
        { Array.from({ length: 7 }, (_, i) => {
            return (
                <div key={i} style={{ textAlign: 'center', padding: '2px', backgroundColor: 'white', color: colors.grey[400], cursor: 'pointer' }}>
                    {format(daysToDisplay[i], 'eeeee')}
                </div>
            )
        })}
        {daysToDisplay.map((day, index) => {
            let backgroundColor: string = colors.grey[50];
            let color = 'black';

            if (isToday(day)) {
                color = 'white';
                backgroundColor = colors.red.A400;
            }
            else if (selectedDayInMinimap && isSameDay(selectedDayInMinimap, day)) 
                backgroundColor = colors.red[50];
            else if (isWithinInterval(day, {
                start: params.selectedWeek.startOfWeek,
                end: params.selectedWeek.endOfWeek
            }))
                backgroundColor = colors.blue[100]
            else if (isSameMonth(startDate, day))
                backgroundColor = colors.blue[50]

            return (
                <div key={index} style={{ textAlign: 'center', padding: '2px', backgroundColor, color, cursor: 'pointer' }} onClick={() => setNewWeekHandler(day)}>
                    {format(day, 'd')}
                </div>
            )
        })}
        </div>
    </div>
  );
}

export default MonthMinimap;