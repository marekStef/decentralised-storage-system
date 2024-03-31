import React, { useState } from 'react';
import {
    TextField,
    Button,
    Grid,
    Tooltip,
} from "@mui/material";

import SaveIcon from '@mui/icons-material/Save';
import appConstants from "@/constants/appConstants";

interface AndroidLocationExistingSetupParams {
    setViewInstanceTokenForLocationTracker: (token: string) => void
}

const AndroidLocationExistingSetup: React.FC<AndroidLocationExistingSetupParams> = (params) => {
    const [viewInstanceAccessTokenForLocationTrackerData, setViewInstanceAccessTokenForLocationTrackerData] = useState<string>('');
    
    const saveToken = () => {
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
                <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    onClick={saveToken}
                    startIcon={<SaveIcon />}
                >
                    Save Configuration
                </Button>
            </Grid>
        </Grid>
    )
}

export default AndroidLocationExistingSetup;