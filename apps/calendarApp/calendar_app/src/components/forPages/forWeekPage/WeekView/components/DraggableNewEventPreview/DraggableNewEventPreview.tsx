import React, { useState, useEffect, useRef, useCallback } from 'react';
import CurrentHourLine from '../HourLines/CurrentHourLine';
import SelectedHourLine from '../HourLines/SelectedHourLine';
import { timeConstants } from '@/constants/timeConstants';
import { addDurationToTime, setTime } from './helpers/timehelpers';
import SelectedWeek from '@/data/SelectedWeek';
import { Event } from '../../../../../../data/EventsManager';
import { NewEventDialogOpenMode } from '@/components/NewEventDialogMaterial/NewEventDialogMaterial';

const convertToLowerMultipleOf5 = (num: number) : number => {
    return Math.round(num / 5) * 5;
}

const disableTextSelection = (document: Document) => {
    document.body.style.userSelect = 'none';
}

const enableTextSelection = (document: Document) : void => {
    document.body.style.userSelect = '';
}

const getAdjustedYOffsetWithRespectToScroll = (scrollContainerRef: React.RefObject<HTMLDivElement>, event: MouseEvent) : number => {
    if (!scrollContainerRef.current) 
        return 0;
    const scrollOffset = scrollContainerRef.current.scrollTop;
    return event.clientY + scrollOffset;
}

const getAdjustedXOffsetWithRespectToScroll = (scrollContainerRef: React.RefObject<HTMLDivElement>, event: MouseEvent) : number => {
    if (!scrollContainerRef.current) 
        return 0;
    return event.clientX + scrollContainerRef.current.scrollLeft;
}

const getHorizontalOffsetStartingAtTheFirstAtTheStartOfFirstDayColumn = (adjustedXOffset: number, calendarLeftOffsetInPixels: number, calendarLeftColumnHoursWidthInPixels: number) : number => {
    return adjustedXOffset - calendarLeftOffsetInPixels - calendarLeftColumnHoursWidthInPixels;
}

const getSelectedDayIndexBasedOnFirstHorizontalIndexAndHourSlot = (horizontalOffsetStartingFromTheFirstDayColumn: number, hourSlotWidth: number) : number => {
    return Math.floor(horizontalOffsetStartingFromTheFirstDayColumn / hourSlotWidth)
}

const getVerticalOffsetStartingFromTheFirstHourRow = (adjustedYOffset: number, calendarTopOffsetInPixels: number, calendarHeaderHeightInPixels: number) : number => {
    return adjustedYOffset - calendarTopOffsetInPixels - calendarHeaderHeightInPixels;
}

const getSelectedHourBasedOnVerticalOffsetStartingFromTheFirstHourRow = (verticalOffsetStartingFromTheFirstHourRow: number, hourSlotHeight: number) : number => {
    return Math.floor(verticalOffsetStartingFromTheFirstHourRow / hourSlotHeight)
}

const getSelectedMinuteBasedOnVerticalOffsetStartingFromTheFirstHourRow = (verticalOffsetStartingFromTheFirstHourRow: number, hourSlotHeight: number) : number => {
    return convertToLowerMultipleOf5((60 / hourSlotHeight) * (verticalOffsetStartingFromTheFirstHourRow % hourSlotHeight));
}

interface DraggableNewEventPreviewParams {
    openNewEventDialogHandler: (data: Event, dialogMode: NewEventDialogOpenMode) => void
    hourSlotHeight: number,
    calendarLeftOffsetInPixels: number,
    calendarLeftColumnHoursWidthInPixels: number,
    calendarTopOffsetInPixels: number,
    headerHeight: number,
    hourSlotWidth: number,
    scrollContainerRef: React.RefObject<HTMLDivElement>,
    calendarHeight: number,
    calendarWidth: number,
    selectedWeek: SelectedWeek
}

const getNumberOfMinutesBasedOnTheOffsetAndSlotHeight = (startOffset: number, endOffset: number, slotHeight: number) => {
    return convertToLowerMultipleOf5(((endOffset - startOffset) / slotHeight) * 60)
}

const DraggableNewEventPreview: React.FC<DraggableNewEventPreviewParams> = (params) => {
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [selectedStartTime, setSelectedStartTime] = useState({
        dayIndex: 0,
        hour: 0,
        minute: 0
    });

    // this needs to be here for useCallback to work !
    const startYRef = useRef(startY);
    const currentYRef = useRef(currentY);
    const selectedStartTimeRef = useRef(selectedStartTime);
    const selectedWeekRef = useRef(params.selectedWeek);

    useEffect(() => {
        selectedWeekRef.current = params.selectedWeek;
        console.log('change in week', params.selectedWeek.convertSelectedWeekToSimpleISODatesObject());
    }, [params.selectedWeek]);

    const [durationTime, setDurationTime] = useState(0);


    const handleMouseMove = (event: MouseEvent) => {
        if (isDragging && params.scrollContainerRef && params.scrollContainerRef.current) {
            const scrollOffset = params.scrollContainerRef.current.scrollTop;
            const adjustedCurrentY = event.clientY + scrollOffset;

            setCurrentY(adjustedCurrentY);
            currentYRef.current = adjustedCurrentY;
            setDurationTime(convertToLowerMultipleOf5(( timeConstants.ONE_HOUR_IN_MINUTES / params.hourSlotHeight ) * (adjustedCurrentY - startY)))
        }
    };

    const getCurrentSelectedWeek = () => {
        return params.selectedWeek;
    }

    const openNewEventDialogHandler = useCallback(() => {
        // console.log(`current: ${currentYRef.current}, start: ${startYRef.current}`)
        // console.log(selectedStartTimeRef.current)
        const duration = getNumberOfMinutesBasedOnTheOffsetAndSlotHeight(startYRef.current, currentYRef.current, params.hourSlotHeight);
        if (duration > 0 && duration < timeConstants.NUMBER_OF_MINUTES_IN_DAY) {
            // console.log(duration)
            // console.log(selectedStartTimeRef.current.dayIndex)
            const currentSelectedWeek = selectedWeekRef.current;

            const selectedDayDate: Date = currentSelectedWeek.getDayInThisWeekAccordingToIndexStartingFromMonday(selectedStartTimeRef.current.dayIndex);
            console.log('alsdfjalkfdjaskdf', currentSelectedWeek.convertSelectedWeekToSimpleISODatesObject());
            const startTime: Date = setTime(selectedDayDate, selectedStartTimeRef.current.hour, selectedStartTimeRef.current.minute)
            console.log(Event.getNewEventWithDefaultDuration(startTime, addDurationToTime(startTime, duration)))
            params.openNewEventDialogHandler(
                Event.getNewEventWithDefaultDuration(startTime, addDurationToTime(startTime, duration)),
                NewEventDialogOpenMode.NEW_EVENT
            );
        }
        // console.log(duration);
      }, [selectedStartTimeRef, startYRef, currentYRef, params.hourSlotHeight, params.selectedWeek]);

    

    useEffect(() => {
        const handleMouseUp = () => {
            openNewEventDialogHandler();
            setIsDragging(false);
            enableTextSelection(document);
        };

        if (params.scrollContainerRef.current) {
            params.scrollContainerRef.current.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            if (params.scrollContainerRef.current) {
                document.removeEventListener('mouseup', handleMouseUp);
            }
        };
    }, [params.scrollContainerRef.current]); // Only re-run the effect if isDragging changes

    useEffect(() => {
        if (isDragging && params.scrollContainerRef.current) {
            params.scrollContainerRef.current.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            if (params.scrollContainerRef.current) {
                document.removeEventListener('mousemove', handleMouseMove);
            }
        }
    }, [isDragging])

    useEffect(() => {
        const handleMouseDown = (event: MouseEvent) => {
            if (params.scrollContainerRef && params.scrollContainerRef.current) {
                const adjustedStartY = getAdjustedYOffsetWithRespectToScroll(params.scrollContainerRef, event);
                const adjustedXOffset = getAdjustedXOffsetWithRespectToScroll(params.scrollContainerRef, event)

                const horizontalOffsetStartingFromTheFirstDayColumn = getHorizontalOffsetStartingAtTheFirstAtTheStartOfFirstDayColumn(adjustedXOffset, params.calendarLeftOffsetInPixels, params.calendarLeftColumnHoursWidthInPixels);
                const dayIndex = getSelectedDayIndexBasedOnFirstHorizontalIndexAndHourSlot(horizontalOffsetStartingFromTheFirstDayColumn, params.hourSlotWidth);

                const verticalOffsetStartingFromTheFirstHourRow = getVerticalOffsetStartingFromTheFirstHourRow(adjustedStartY, params.calendarTopOffsetInPixels, params.headerHeight);
                const selectedHourIndex = getSelectedHourBasedOnVerticalOffsetStartingFromTheFirstHourRow(verticalOffsetStartingFromTheFirstHourRow, params.hourSlotHeight)
                const selectedMinuteIndex = getSelectedMinuteBasedOnVerticalOffsetStartingFromTheFirstHourRow(verticalOffsetStartingFromTheFirstHourRow, params.hourSlotHeight)

                if (dayIndex < 0 || selectedHourIndex < 0) return;


                setSelectedStartTime({
                    dayIndex,
                    hour: selectedHourIndex,
                    minute: selectedMinuteIndex
                });

                selectedStartTimeRef.current = {
                    dayIndex,
                    hour: selectedHourIndex,
                    minute: selectedMinuteIndex
                }

                disableTextSelection(document);

                // console.log(dayIndex)

                const calendarYOffsetStart = params.calendarTopOffsetInPixels + params.headerHeight;
                const fiveMinuteYOffset = calendarYOffsetStart + (selectedHourIndex * params.hourSlotHeight + (params.hourSlotHeight / 60) * selectedMinuteIndex)

                setStartY(fiveMinuteYOffset);
                startYRef.current = fiveMinuteYOffset;
                setCurrentY(fiveMinuteYOffset);

                const calendarXOffsetStart = params.calendarLeftOffsetInPixels + params.calendarLeftColumnHoursWidthInPixels

                setStartX(calendarXOffsetStart + dayIndex * (params.hourSlotWidth))
                setIsDragging(true);
            }
        };

        if (params.scrollContainerRef.current) {
            params.scrollContainerRef.current.addEventListener('mousedown', handleMouseDown);
        }

        return () => {
            if (params.scrollContainerRef.current)
                params.scrollContainerRef.current.removeEventListener('mousedown', handleMouseDown);
        };
    }, [params.scrollContainerRef, params.calendarTopOffsetInPixels, params.hourSlotWidth])

    const height = Math.max(0, currentY - startY);

    return isDragging && height > 3 && (
        <SelectedHourLine
            leftOffset={startX - params.calendarLeftOffsetInPixels}
            topOffset={startY - params.calendarTopOffsetInPixels}
            heightInPixels={height}
            widthInPixels={params.hourSlotWidth}
            selectedStartTime={selectedStartTime}
            durationTime={durationTime}
        />
    );
};

export default DraggableNewEventPreview;
