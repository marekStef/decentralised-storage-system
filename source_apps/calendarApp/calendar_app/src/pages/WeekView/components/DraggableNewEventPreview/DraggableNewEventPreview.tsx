import React, { useState, useEffect } from 'react';
import CurrentHourLine from '../HourLines/CurrentHourLine';
import SelectedHourLine from '../HourLines/SelectedHourLine';

const DraggableNewEventPreview = params => {
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);

    const handleMouseMove = (event: MouseEvent) => {
        if (isDragging && params.scrollContainerRef && params.scrollContainerRef.current) {
            const scrollOffset = params.scrollContainerRef.current.scrollTop;
            const adjustedY = event.clientY + scrollOffset;
            setCurrentY(adjustedY);
        }
    };

    useEffect(() => {
        const handleMouseUp = () => {
            setIsDragging(false);
            
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
                const scrollOffset = params.scrollContainerRef.current.scrollTop;
                const adjustedStartY = event.clientY + scrollOffset;
                document.body.style.userSelect = 'none';
                console.log(adjustedStartY);
                setStartY(adjustedStartY);
                setCurrentY(adjustedStartY);
                setStartX(event.clientX - params.scrollContainerRef.current.scrollLeft)
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
    }, [params.scrollContainerRef, params.startOffsetInPixels])

    // const handleMouseDown = (event) => {
    //     setIsDragging(true);
    //     setStartY(event.clientY);
    //     setCurrentY(event.clientY); // Initialize currentY with startY to avoid initial jump
    // };

    const height = Math.max(0, currentY - startY);

    return isDragging && height > 3 && (
        <SelectedHourLine
                    leftOffset={startX - params.calendarLeftOffsetInPixels}
                    topOffset={startY - params.startOffsetInPixels}
                    heightInPixels={height}
                    widthInPixels={params.hourSlotWidth / 3}
                />
    );
};

export default DraggableNewEventPreview;
