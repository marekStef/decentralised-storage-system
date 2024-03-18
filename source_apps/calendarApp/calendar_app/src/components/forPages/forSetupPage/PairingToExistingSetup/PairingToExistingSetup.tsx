import React, { useState } from 'react';
import { useRouter } from 'next/router';

import {
    Container,
    TextField,
    Button,
    Grid,
    Typography,
    CircularProgress,
    Box,
    Tooltip,
} from '@mui/material';

import SaveIcon from '@mui/icons-material/Save';

import persistenceManager from '@/data/PersistenceManager';

const PairingToExistingSetup = () => {
    const Router = useRouter();

    const [jwtTokenForPermissionRequestsAndProfiles, setJwtTokenForPermissionRequestsAndProfiles] = useState('')
    const [accessTokenToProfile, setAccessTokenToProfile] = useState('')


    const saveTokens = () => {
        persistenceManager.setJwtTokenForPermissionsAndProfiles(jwtTokenForPermissionRequestsAndProfiles);
        persistenceManager.setAccessTokenForEvents(accessTokenToProfile);
        Router.replace('/')
    }

    return (
        <Container>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="jwtTokenForPermissionRequestsAndProfiles"
                        type="text"
                        variant="outlined"
                        value={jwtTokenForPermissionRequestsAndProfiles}
                        onChange={event => setJwtTokenForPermissionRequestsAndProfiles(event.target.value)}
                        helperText="You can get this token from the DataStorage system"
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Access Token for CalendarPro.com_CalendarEventProfile (R,W,M,D)"
                        type="text"
                        variant="outlined"
                        value={accessTokenToProfile}
                        onChange={event => setAccessTokenToProfile(event.target.value)}
                        helperText="You can get this token from the DataStorage system"
                    />
                </Grid>

                <Grid item xs={12}>
                    <Tooltip title="Send permissions to the server" enterDelay={3000}>
                        <span>
                            <Button
                                variant="contained"
                                color="secondary"
                                fullWidth
                                onClick={saveTokens}
                                startIcon={<SaveIcon />}
                            >
                                Save Configuration
                            </Button>
                        </span>
                    </Tooltip>
                </Grid>
                </Grid>
        </Container>
    )
}

export default PairingToExistingSetup;