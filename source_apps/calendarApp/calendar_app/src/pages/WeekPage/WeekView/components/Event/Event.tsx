import { Event } from "@/data/EventsManager";
import { Typography, IconButton, Button } from '@mui/material';
import Popover from "@mui/material/Popover";
import { differenceInMinutes, format } from "date-fns";
import React, { useState } from "react";

import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

const getEventHeight = (calendarHeight: number, durationInMinutes: number) => {
    const hourHeight = calendarHeight / 24;
    const eventHeight = (durationInMinutes / 60) * hourHeight;
    return eventHeight;
};

const EventPopover = ({
    event,
    open,
    anchorEl,
    handlePopoverClose,
    handleEdit,
}) => {
    return (
        <Popover
            id={open ? 'mouse-over-popover' : undefined}
            sx={{
                pointerEvents: 'auto',
                '& .MuiPopover-paper': {
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
            open={open}
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            onClose={handlePopoverClose}
            disableRestoreFocus
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="h2">
                    {event.title}
                </Typography>
                <IconButton onClick={handlePopoverClose}>
                    <CloseIcon />
                </IconButton>
            </div>
            <Typography sx={{ mt: 1 }}>
                {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                <br />
                {event.description}
            </Typography>
            <Button
                startIcon={<EditIcon />}
                onClick={handleEdit}
                variant="outlined"
                sx={{ mt: 2, alignSelf: 'flex-start' }}
            >
                Edit
            </Button>
        </Popover>
    );
};

interface EventUIParams {
    event: Event;
    topOffset: number;
    leftOffset: number;
    width: number;
    calendarHeight: number;
}

const EventUI: React.FC<EventUIParams> = (params) => {
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [shouldEventBeOnTop, setShouldEventBeOnTop] = useState(false);

    const handlePopoverOpen = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const handleEventEdit = () => {
        // todo
    }

    // const durationMinutes = params.event.endTime.getHours() * 60 + params.event.endTime.getMinutes() 
    //     - (params.event.startTime.getHours() * 60 + params.event.startTime.getMinutes());
    const durationMinutes = differenceInMinutes(params.event.endTime, params.event.startTime)

    const eventHeight = getEventHeight(params.calendarHeight, durationMinutes);

    return (
        <>
            <div
                style={{
                    position: "absolute",
                    top: `${params.topOffset}px`,
                    left: `${params.leftOffset}%`,
                    width: `${params.width}%`,
                    height: `${eventHeight}px`,
                    padding: "1px",
                    margin: "1px 0",
                    borderRadius: "5px",
                    fontSize: "11px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    border: "1px #ccc solid",
                    backgroundColor: params.event.color ?? 'white',
                    zIndex: shouldEventBeOnTop || open ? 1000 : 50
                }}
                className="hover:shadow-md cursor-pointer"
                onClick={handlePopoverOpen}
                onMouseEnter={() => setShouldEventBeOnTop(true)}
                onMouseLeave={() => setShouldEventBeOnTop(false)}
            >
                <strong title={params.event.title}>
                    {params.event.title} 
                    
                </strong>
                <p>{format(params.event.startTime, 'HH:mm')} - {format(params.event.endTime, 'HH:mm')}</p>
            </div>
            <EventPopover 
                event={params.event} 
                open={open} 
                anchorEl={anchorEl} 
                handlePopoverClose={handlePopoverClose}
                handleEdit={handleEventEdit}
            />
        </>
    );
};


export default EventUI;