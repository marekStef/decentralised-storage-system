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
import appConstants from '@/constants/appConstants';

const PairingToExistingSetup = () => {
    const Router = useRouter();

    const [jwtTokenForPermissionRequestsAndProfiles, setJwtTokenForPermissionRequestsAndProfiles] = useState<string>('')
    const [accessTokenToProfile, setAccessTokenToProfile] = useState<string>('')
    const [viewInstanceAccessTokenForCalendarEventsFetching, setViewInstanceAccesstokenForcalendarEventsFetching] = useState<string>('');


    const saveTokens = () => {
        persistenceManager.setJwtTokenForPermissionsAndProfiles(jwtTokenForPermissionRequestsAndProfiles);
        persistenceManager.setAccessTokenForEvents(accessTokenToProfile);
        persistenceManager.setViewInstanceAccessTokenForCalendarEventsFetching(viewInstanceAccessTokenForCalendarEventsFetching);
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
                    <TextField
                        fullWidth
                        label={"View Instance Access Token (named: " + appConstants.viewInstanceAccessNameForCalendarEventsFetchingBasedOnSelectedWeek + ")"}
                        type="text"
                        variant="outlined"
                        value={viewInstanceAccessTokenForCalendarEventsFetching}
                        onChange={event => setViewInstanceAccesstokenForcalendarEventsFetching(event.target.value)}
                        helperText="This token should be found near the existing app holder data"
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