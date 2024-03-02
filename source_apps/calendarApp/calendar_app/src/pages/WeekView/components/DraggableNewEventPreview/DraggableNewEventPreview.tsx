import React, { useState, useEffect } from 'react';
import CurrentHourLine from '../HourLines/CurrentHourLine';
import SelectedHourLine from '../HourLines/SelectedHourLine';
import { timeConstants } from '@/constants/timeConstants';

const convertToLowerMultipleOf5 = (num: number) : number => {
    return Math.round(num / 5) * 5;
}

const disableTextSelection = document => {
    document.body.style.userSelect = 'none';
}

const enableTextSelection = (document) : void => {
    document.body.style.userSelect = '';
}

const getAdjustedYOffsetWithRespectToScroll = (scrollContainerRef, event: MouseEvent) : number => {
    const scrollOffset = scrollContainerRef.current.scrollTop;
    return event.clientY + scrollOffset;
}

const getAdjustedXOffsetWithRespectToScroll = (scrollContainerRef, event: MouseEvent) : number => {
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

const DraggableNewEventPreview = params => {
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);

    const [selectedStartTime, setSelectedStartTime] = useState({
        hour: 0,
        minute: 0
    });

    const [durationTime, setDurationTime] = useState(0);

    const handleMouseMove = (event: MouseEvent) => {
        if (isDragging && params.scrollContainerRef && params.scrollContainerRef.current) {
            const scrollOffset = params.scrollContainerRef.current.scrollTop;
            const adjustedCurrentY = event.clientY + scrollOffset;

            setCurrentY(adjustedCurrentY);
            setDurationTime(convertToLowerMultipleOf5(( timeConstants.ONE_HOUR_IN_MINUTES / params.hourSlotHeight ) * (adjustedCurrentY - startY)))
        }
    };

    useEffect(() => {
        const handleMouseUp = () => {
            setIsDragging(false);
            enableTextSelection(document);
        };

        if (isDragging && params.scrollContainerRef.current) {
            params.scrollContainerRef.current.addEventListener('mousemove', handleMouseMove);
            params.scrollContainerRef.current.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            if (params.scrollContainerRef.current) {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            }
        };
    }, [isDragging]); // Only re-run the effect if isDragging changes

    useEffect(() => {
        const handleMouseDown = (event: MouseEvent) => {
            if (params.scrollContainerRef && params.scrollContainerRef.current) {
                const adjustedStartY = getAdjustedYOffsetWithRespectToScroll(params.scrollContainerRef, event);
                const adjustedXOffset = getAdjustedXOffsetWithRespectToScroll(params.scrollContainerRef, event)

                const horizontalOffsetStartingFromTheFirstDayColumn = getHorizontalOffsetStartingAtTheFirstAtTheStartOfFirstDayColumn(adjustedXOffset, params.calendarLeftOffsetInPixels, params.calendarLeftColumnHoursWidthInPixels);
                const selectedDayIndex = getSelectedDayIndexBasedOnFirstHorizontalIndexAndHourSlot(horizontalOffsetStartingFromTheFirstDayColumn, params.hourSlotWidth);

                const verticalOffsetStartingFromTheFirstHourRow = getVerticalOffsetStartingFromTheFirstHourRow(adjustedStartY, params.calendarTopOffsetInPixels, params.headerHeight);
                const selectedHourIndex = getSelectedHourBasedOnVerticalOffsetStartingFromTheFirstHourRow(verticalOffsetStartingFromTheFirstHourRow, params.hourSlotHeight)
                const selectedMinuteIndex = getSelectedMinuteBasedOnVerticalOffsetStartingFromTheFirstHourRow(verticalOffsetStartingFromTheFirstHourRow, params.hourSlotHeight)

                if (selectedDayIndex < 0 || selectedHourIndex < 0) return;

                setSelectedStartTime({
                    hour: selectedHourIndex,
                    minute: selectedMinuteIndex
                });

                disableTextSelection(document);

                console.log(selectedDayIndex)

                const calendarYOffsetStart = params.calendarTopOffsetInPixels + params.headerHeight;
                const fiveMinuteYOffset = calendarYOffsetStart + (selectedHourIndex * params.hourSlotHeight + (params.hourSlotHeight / 60) * selectedMinuteIndex)

                setStartY(fiveMinuteYOffset);
                setCurrentY(fiveMinuteYOffset);

                const calendarXOffsetStart = params.calendarLeftOffsetInPixels + params.calendarLeftColumnHoursWidthInPixels

                setStartX(calendarXOffsetStart + selectedDayIndex * (params.hourSlotWidth))
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
