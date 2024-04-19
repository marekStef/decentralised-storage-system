import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions, FormControl, InputLabel, Select, MenuItem, colors, ListItemText, ListItemIcon } from '@mui/material';
import 'dayjs/locale/cs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import { addMinutes } from 'date-fns';
import { timeConstants } from '@/constants/timeConstants';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { sk } from 'date-fns/locale/sk';

import { SyncLoader } from "react-spinners";

import { Event, EventMetadata, EventPayload } from '@/data/EventsManager';

const colorsForSelection = [
    { name: 'Red1', value: '#9b2226' },
    { name: 'Red2', value: '#ae2012' },
    { name: 'Red3', value: '#bb3e03' },
    { name: 'Blue1', value: '#2196f3' },
    { name: 'Blue2', value: '#90e0ef' },
    { name: 'Blue3', value: '#caf0f8' },
    { name: 'Green1', value: '#132a13' },
    { name: 'Green2', value: '#31572c' },
    { name: 'Green3', value: '#4f772d' },
    { name: 'Green4', value: '#90a955' },
];

export enum NewEventDialogOpenMode {
    NEW_EVENT,
    EDIT_EXISTING_EVENT,
    CLOSED
}

interface NewEventDialogMaterialParams {
    handleClose: () => void,
    newEventDialogData: Event | null,
    createNewEventHandler: (newEvent: Event) => Promise<void>,
    modifyEventHandler: (newEvent: Event) => void,
    deleteEventHandler: (newEvent: Event) => void,
    isCreatingNewEvent: boolean,
    mode: NewEventDialogOpenMode
}

const NewEventDialogMaterial: React.FC<NewEventDialogMaterialParams> = (params) => {
    // const startTimeDate: Date = params.newEventDialogData.payload.startTime;
    // const endTimeDate: Date = params.newEventDialogData.payload.endTime;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState<Date | null>(null);
    // const [startTime, setStartTime] = React.useState<Dayjs | null>(dayjs('2022-04-17T15:30'));
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [color, setColor] = useState("#ffffff");

    useEffect(() => {
        if (params.newEventDialogData != null) {
            const { payload } = params.newEventDialogData;
            setTitle(payload.title);
            setDescription(payload.description);
            setStartTime(new Date(payload.startTime));
            setEndTime(new Date(payload.endTime));
            setColor(colorsForSelection[0].value);
        }
    }, [params.newEventDialogData])

    if (params.newEventDialogData == null) return <></>;

    const createNewEventHandler = () => {
        if (!startTime) return;

        console.log({ title, description, startTime, endTime, color });
        if (endTime == null) return;
        const newEvent: Event = new Event(null, new EventPayload(startTime, endTime, title, description, color), new EventMetadata());
        params.createNewEventHandler(newEvent)
            .then(_ => {
                params.handleClose();
            })
            .catch(_ => {
                // there was some error
            })
    }

    const editExistingEventHandler = () => {
        if (!startTime || !endTime || params.newEventDialogData?.metadata == null) return;
        const editedEvent: Event = new Event(params.newEventDialogData.id, new EventPayload(startTime, endTime, title, description, color), params.newEventDialogData.metadata);
        console.log(params.newEventDialogData);
        console.log(editedEvent);
        params.modifyEventHandler(editedEvent)
    }

    const handleSubmit = () => {
        if (params.mode == NewEventDialogOpenMode.EDIT_EXISTING_EVENT) {
            editExistingEventHandler();
        }
        else if (params.mode == NewEventDialogOpenMode.NEW_EVENT) {
            createNewEventHandler();
        }
       
    };

    return (
        <Dialog open={params.mode != NewEventDialogOpenMode.CLOSED} onClose={params.handleClose}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <DialogTitle>{params.mode == NewEventDialogOpenMode.EDIT_EXISTING_EVENT ? "Edit" : "Add"} New Event</DialogTitle>
                <SyncLoader
                    color={colors.grey[400]}
                    loading={params.isCreatingNewEvent}
                    size={5}
                />

            </div>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="normal"
                    id="title"
                    label="Title"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <TextField
                    margin="normal"
                    id="description"
                    label="Description"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={sk}>
                    <DateTimePicker label="Start Time" value={startTime} onChange={(newValue: Date | null) => newValue && setStartTime(new Date(newValue))} />
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={sk}>
                    <DateTimePicker label="End Time" value={endTime} onChange={(newValue: Date | null) => newValue && setEndTime(new Date(newValue))} />
                </LocalizationProvider>

                <FormControl fullWidth margin="normal">
                    <InputLabel id="color-label">Color</InputLabel>
                    <Select
                        labelId="color-label"
                        id="color"
                        value={color}
                        label="Color"
                        onChange={(e) => setColor(e.target.value)}
                    >
                        {colorsForSelection.map((colorOption) => (
                            <MenuItem key={colorOption.value} value={colorOption.value}>
                                <ListItemText primary={colorOption.name} />
                                <ListItemIcon>
                                    <div style={{ height: '1rem', width: '1rem', borderRadius: '50%', backgroundColor: colorOption.value }} />
                                </ListItemIcon>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={params.handleClose}>Cancel</Button>
                <Button onClick={handleSubmit}>{params.mode == NewEventDialogOpenMode.EDIT_EXISTING_EVENT ? "Edit" : "Add"} Event</Button>
            </DialogActions>
        </Dialog>
    );
};

export default NewEventDialogMaterial;