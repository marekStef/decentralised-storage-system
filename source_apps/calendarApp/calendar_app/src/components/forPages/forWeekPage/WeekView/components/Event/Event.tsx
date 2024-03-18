import { Event } from "@/data/EventsManager";
import { Typography, IconButton, Button } from '@mui/material';
import Popover from "@mui/material/Popover";
import { differenceInMinutes, format } from "date-fns";
import React, { useState } from "react";

import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { NewEventDialogOpenMode } from "@/components/NewEventDialogMaterial/NewEventDialogMaterial";

const getEventHeight = (calendarHeight: number, durationInMinutes: number) => {
    const hourHeight = calendarHeight / 24;
    const eventHeight = (durationInMinutes / 60) * hourHeight;
    return eventHeight;
};

interface EventPopoverParams {
    event: Event,
    open: boolean,
    anchorEl: any,
    handlePopoverClose: () => void,
    handleEdit: () => void,
    deleteEventHandler: (newEvent: Event) => void,
}

const EventPopover: React.FC<EventPopoverParams> = ({
    event,
    open,
    anchorEl,
    handlePopoverClose,
    handleEdit,
    deleteEventHandler
}) => {
    const [deleteAlertShown, setDeleteAlertShown] = useState<boolean>(false);

    const close = () => {
        setDeleteAlertShown(false);
        handlePopoverClose();
    }

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
            onClose={close}
            disableRestoreFocus
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="h2">
                    {event.payload.title}
                </Typography>
                <IconButton onClick={close}>
                    <CloseIcon />
                </IconButton>
            </div>
            <Typography sx={{ mt: 1 }}>
                {format(event.payload.startTime, 'HH:mm')} - {format(event.payload.endTime, 'HH:mm')}
                <br />
                {event.payload.description}
            </Typography>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', alignSelf: 'flex-start' }}>
                <Button
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    variant="outlined"
                >
                    Edit
                </Button>
                <Button
                    startIcon={<DeleteIcon sx={{ color: 'red' }} />}
                    onClick={() => {
                        if (!deleteAlertShown) {
                            setDeleteAlertShown(true);
                        } else {
                            deleteEventHandler(event);
                            setDeleteAlertShown(false);
                        }
                    }}
                    variant="outlined"
                    sx={{ color: 'red', borderColor: 'red' }}
                >
                    {deleteAlertShown ? 'Really?' : 'Delete'}
                </Button>
            </div>
        </Popover>
    );
};

interface EventUIParams {
    event: Event,
    topOffset: number,
    leftOffset: number,
    width: number,
    calendarHeight: number,
    openNewEventDialogHandler: (data: Event, dialogMode: NewEventDialogOpenMode) => void,
    deleteEventHandler: (newEvent: Event) => void,
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
        params.openNewEventDialogHandler(params.event, NewEventDialogOpenMode.EDIT_EXISTING_EVENT);
    }

    // const durationMinutes = params.event.endTime.getHours() * 60 + params.event.endTime.getMinutes() 
    //     - (params.event.startTime.getHours() * 60 + params.event.startTime.getMinutes());
    const durationMinutes = differenceInMinutes(params.event.payload.endTime, params.event.payload.startTime)

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
                    backgroundColor: params.event.payload.color ?? 'white',
                    zIndex: shouldEventBeOnTop || open ? 1000 : 50
                }}
                className="hover:shadow-md cursor-pointer"
                onClick={handlePopoverOpen}
                onMouseEnter={() => setShouldEventBeOnTop(true)}
                onMouseLeave={() => setShouldEventBeOnTop(false)}
            >
                <strong title={params.event.payload.title}>
                    {params.event.payload.title}

                </strong>
                <p>{format(params.event.payload.startTime, 'HH:mm')} - {format(params.event.payload.endTime, 'HH:mm')}</p>
            </div>
            <EventPopover
                event={params.event}
                open={open}
                anchorEl={anchorEl}
                handlePopoverClose={handlePopoverClose}
                handleEdit={handleEventEdit}
                deleteEventHandler={params.deleteEventHandler}
            />
        </>
    );
};


export default EventUI;