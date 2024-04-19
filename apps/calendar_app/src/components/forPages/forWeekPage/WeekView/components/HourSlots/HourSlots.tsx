import React from 'react';
import { convertToLowerMultipleOf5 } from "../DraggableNewEventPreview/helpers/timehelpers";
import { NewEventDialogOpenMode } from '@/components/NewEventDialogMaterial/NewEventDialogMaterial';
import { Event } from "@/data/EventsManager";
import { colors } from "@/constants/colors";
import { DayOfWeek } from '@/data/SelectedWeek';
import CategoryBar from './components/CategoryBar';

interface HourSlotsParams {
    calendarHeight: number,
    calendarHeaderHeightInPixels: number,
    day: DayOfWeek,
    openNewEventDialogHandler: (data: Event, dialogMode: NewEventDialogOpenMode) => void,
    windowsAppsCategoriesByHours: Array<object> | null
}

const HourSlots : React.FC<HourSlotsParams> = (params) =>  {
    const slotHeight = params.calendarHeight / 24

    const onClickHandler = (offsetY: number, hour: number) => {
        const minute = convertToLowerMultipleOf5(Math.max(0, Math.floor((offsetY / slotHeight) * 60)))

        // handleHourClick(
        //     params.day,
        //     hour,
        //     minute
        // );

        params.openNewEventDialogHandler(
            Event.getNewEventWithDefaultDuration(new Date(params.day.date.getFullYear(), params.day.date.getMonth(), params.day.date.getDate(), hour, minute)),
            NewEventDialogOpenMode.NEW_EVENT
        )
    }

    return (
        <>
            {Array.from({ length: 24 }).map(
                (_, hour) => {
                    const topOffset = params.calendarHeaderHeightInPixels + hour * slotHeight;
                    

                    return (
                        <div
                            key={hour}
                            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                                const clickY = e.nativeEvent.offsetY;
                                onClickHandler(clickY, hour);
                            }}
                            style={{
                                height: `${slotHeight}px`,
                                borderLeft: `1px solid ${colors.gray2}`,
                                position: "absolute",
                                top: `${topOffset}px`,
                                width: `10px`,
                                zIndex: 80,
                                background: 'transparent',
                            }}
                            className="hover:bg-slate-50 bg-white"
                        >
                            {(params.windowsAppsCategoriesByHours != null && Object.keys(params.windowsAppsCategoriesByHours[hour]).length != 0) && (
                                <CategoryBar windowsAppsCategoriesPercentagesForGivenHour={params.windowsAppsCategoriesByHours[hour]} />
                            )}
                        </div>
                    );
                }
            )}
        </>
        
    );
};

export default HourSlots;