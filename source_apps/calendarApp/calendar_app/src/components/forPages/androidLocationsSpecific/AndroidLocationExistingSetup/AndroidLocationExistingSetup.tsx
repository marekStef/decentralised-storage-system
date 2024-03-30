import React, { useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Grid,
    Typography,
    CircularProgress,
    Box,
    Tooltip,
    ToggleButton,
    ToggleButtonGroup,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Alert,
} from "@mui/material";

import SaveIcon from '@mui/icons-material/Save';
import persistenceManager from '@/data/PersistenceManager';
import appConstants from "@/constants/appConstants";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ActivityButton from "@mui/icons-material/LocalActivity";

interface AndroidLocationExistingSetupParams {
    setViewInstanceTokenForLocationTracker: (token: string) => void
}

const AndroidLocationExistingSetup: React.FC<AndroidLocationExistingSetupParams> = (params) => {

    const [viewInstanceAccessTokenForLocationTrackerData, setViewInstanceAccessTokenForLocationTrackerData] = useState<string>('');
    
    const saveTokens = () => {
        params.setViewInstanceTokenForLocationTracker(viewInstanceAccessTokenForLocationTrackerData);
    }

    return (
        <Grid container spacing={2} sx={{ my: 4 }}>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label={"View Instance Access Token (named: " + appConstants.viewInstanceAccessNameForLocationTrackerAppData + ")"}
                    type="text"
                    variant="outlined"
                    value={viewInstanceAccessTokenForLocationTrackerData}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setViewInstanceAccessTokenForLocationTrackerData(event.target.value)}
                    helperText="This token should be found near the existing app holder data"
                />
            </Grid>

            <Grid item xs={12}>
                <Tooltip title="Send permissions to the server" enterDelay={3000}>
                    <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={saveTokens}
                        startIcon={<SaveIcon />}
                    >
                        Save Configuration
                    </Button>
                </Tooltip>
            </Grid>
        </Grid>
    )
}

export default AndroidLocationExistingSetup;