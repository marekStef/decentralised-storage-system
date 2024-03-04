import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions, FormControl, InputLabel, Select, MenuItem, colors, ListItemText, ListItemIcon } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/cs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import { addMinutes } from 'date-fns';
import { timeConstants } from '@/constants/timeConstants';

import { SyncLoader } from "react-spinners";

import { Event } from '@/data/EventsManager';

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

export class NewEventDialogData {
    startTimeDate: Date | null;
    endTimeDate: Date | null;
    constructor(startTimeDate: Date | null, endTimeDate: Date | null) {
        this.startTimeDate = startTimeDate;
        this.endTimeDate = endTimeDate;
    }
}

interface NewEventDialogMaterialParams {
    open: boolean,
    handleClose: () => void,
    newEventDialogData: NewEventDialogData | null,
    createNewEventHandler: (newEvent: Event) => Promise<void>,
    isCreatingNewEvent: boolean
}

const NewEventDialogMaterial: React.FC<NewEventDialogMaterialParams> = ({ open, handleClose, newEventDialogData, createNewEventHandler, isCreatingNewEvent }) => {
    if (newEventDialogData == null) return null;

    const startTimeDate: Date = newEventDialogData.startTimeDate ?? new Date();
    const endTimeDate: Date = newEventDialogData.endTimeDate ?? addMinutes(startTimeDate, timeConstants.THIRTY_MINUTES_IN_MINUTES);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState<Date>(startTimeDate);
    const [endTime, setEndTime] = useState<Date | null>(endTimeDate);
    const [color, setColor] = useState(colorsForSelection[0].value);

    const handleSubmit = () => {
        console.log({ title, description, startTime, endTime, color });
        if (endTime == null) return;
        const newEvent: Event = new Event(startTime, endTime, title, description, color);
        createNewEventHandler(newEvent)
            .then(_ => {
                handleClose();
            })
            .catch(_ => {
                // there was some error
            })
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <DialogTitle>Add New Event</DialogTitle>
                <SyncLoader
                    color={colors.grey[400]}
                    loading={isCreatingNewEvent}
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
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="cs">
                    <DateTimePicker label="Start Time" value={dayjs(startTime)} onChange={(newValue: Date | null) => setStartTime(newValue ?? new Date())} />
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="cs" >
                    <DateTimePicker label="End Time" value={dayjs(endTime)} onChange={(newValue: Date | null) => setEndTime(newValue)} />
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
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSubmit}>Add Event</Button>
            </DialogActions>
        </Dialog>
    );
};

export default NewEventDialogMaterial;