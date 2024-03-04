import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/cs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import { addMinutes } from 'date-fns';
import { timeConstants } from '@/constants/timeConstants';

const colors = [
    { name: 'Red', value: '#f44336' },
    { name: 'Blue', value: '#2196f3' },
    { name: 'Green', value: '#4caf50' },
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
    newEventDialogData: NewEventDialogData | null
}

const NewEventDialogMaterial: React.FC<NewEventDialogMaterialParams> = ({ open, handleClose, newEventDialogData }) => {
    if (newEventDialogData == null) return null;

    const startTimeDate: Date = newEventDialogData.startTimeDate ?? new Date();
    const endTimeDate: Date = newEventDialogData.endTimeDate ?? addMinutes(startTimeDate, timeConstants.THIRTY_MINUTES_IN_MINUTES);
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState<Date>(startTimeDate);
    const [endTime, setEndTime] = useState<Date>(endTimeDate);
    const [color, setColor] = useState(colors[0].value);

    const handleSubmit = () => {
        console.log({ title, description, startTime, endTime, color });
        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Add New Event</DialogTitle>
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
                    <DateTimePicker label="End Time" value={dayjs(endTime)} onChange={(newValue) => setEndTime(newValue)}/>
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
                        {colors.map((colorOption) => (
                            <MenuItem key={colorOption.value} value={colorOption.value}>
                                {colorOption.name}
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