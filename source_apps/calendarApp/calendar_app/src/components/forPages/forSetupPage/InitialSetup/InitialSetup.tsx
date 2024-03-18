import React, { useEffect, useState } from 'react';
import networkManager from '@/Network/NetworkManager';
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

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SendIcon from '@mui/icons-material/UploadFileOutlined';
import AssociationIcon from '@mui/icons-material/ConnectWithoutContactOutlined';

import persistenceManager, { HttpProtocolType } from '@/data/PersistenceManager';
import appConstants from '@/constants/appConstants';

import { showSuccess, showError } from '@/components/AlertProvider/AlertProvider';

enum PossibleResultsWithServer {
    NOT_TRIED,
    IS_LOADING,
    SUCCESS,
    FAILED
}

const InitialSetup = () => {
    const Router = useRouter();

    const [associationToken, setAssociationToken] = useState('')

    const [associationWithServerStatus, setAssociationWithServerStatus] = useState<PossibleResultsWithServer>(PossibleResultsWithServer.NOT_TRIED);

    const [profilesSendingStatus, setProfilesSendingStatus] = useState<PossibleResultsWithServer>(PossibleResultsWithServer.NOT_TRIED);

    const [permissionsSendingStatus, setPermissionsSendingStatus] = useState<PossibleResultsWithServer>(PossibleResultsWithServer.NOT_TRIED);

    const associateCalendarWithSystem = () => {
        setAssociationWithServerStatus(PossibleResultsWithServer.IS_LOADING);

        networkManager.associateWithDataStorage(associationToken, appConstants.appName)
            .then(jwtToken => {
                // alert(jwtToken);
                persistenceManager.setJwtTokenForPermissionsAndProfiles(jwtToken);
                setAssociationWithServerStatus(PossibleResultsWithServer.SUCCESS);
            })
            .catch(message => {
                showError(message)
                setAssociationWithServerStatus(PossibleResultsWithServer.FAILED);
                // setAssociationWithServerStatus(PossibleResultsWithServer.SUCCESS);
            })
    }

    const sendProfiles = () => {
        setProfilesSendingStatus(PossibleResultsWithServer.IS_LOADING);
        networkManager.createNewCalendarEventProfileInDataStorage()
            .then(message => {
                showSuccess(message)
                setProfilesSendingStatus(PossibleResultsWithServer.SUCCESS);
            })
            .catch(message => {
                showError(message)
                setProfilesSendingStatus(PossibleResultsWithServer.FAILED);
            })
    };

    const sendPermissions = () => {
        setPermissionsSendingStatus(PossibleResultsWithServer.IS_LOADING);

        networkManager.requestPermissionsForProfile()
            .then(response => {
                showSuccess(response.message)
                // alert(response.generatedAccessToken)
                setPermissionsSendingStatus(PossibleResultsWithServer.SUCCESS);
                persistenceManager.setAccessTokenForEvents(response.generatedAccessToken);
                Router.replace('/');
            })
            .catch(message => {
                showError(message)
                setPermissionsSendingStatus(PossibleResultsWithServer.FAILED);
            })

        // setTimeout(() => {
        //     const isReachable = Math.random() < 0.5;
        //     if (isReachable)
        //         setPermissionsSendingStatus(PossibleResultsWithServer.SUCCESS);
        //     else
        //         setPermissionsSendingStatus(PossibleResultsWithServer.FAILED);
        // }, 500);

        // localStorage.setItem('calendarSetupComplete', "true")
    };

    return (
        <Container>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Association Token"
                        type="text"
                        variant="outlined"
                        value={associationToken}
                        onChange={event => setAssociationToken(event.target.value)}
                        helperText="You can get this token from the DataStorage system"
                        disabled={associationWithServerStatus == PossibleResultsWithServer.SUCCESS}
                    />
                </Grid>

                {associationWithServerStatus != PossibleResultsWithServer.SUCCESS && (
                    <Grid item xs={12}>
                        <Tooltip title="Associate calendar with the system" enterDelay={3000}>
                            <span>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    fullWidth
                                    onClick={associateCalendarWithSystem}
                                    disabled={
                                        associationWithServerStatus == PossibleResultsWithServer.IS_LOADING
                                    }
                                    startIcon={associationWithServerStatus == PossibleResultsWithServer.IS_LOADING ? <CircularProgress size={20} color="inherit" /> : <AssociationIcon />}
                                >
                                    Associate Calendar with the System
                                </Button>
                            </span>
                        </Tooltip>
                    </Grid>
                )}

                <Grid item xs={12} container justifyContent="center" alignItems="center">
                    {associationWithServerStatus == PossibleResultsWithServer.SUCCESS && (
                        <>
                            <CheckCircleOutlineIcon color="success" />
                            <Typography variant="body1" color="success.main" style={{ marginLeft: '1rem' }}>Successfully Associated</Typography>
                        </>
                    )}
                    {associationWithServerStatus == PossibleResultsWithServer.FAILED && (
                        <>
                            <ErrorOutlineIcon color="error" />
                            <Typography variant="body1" color="error.main" style={{ marginLeft: '1rem' }}>Association Failed</Typography>
                        </>
                    )}
                </Grid>

                {profilesSendingStatus != PossibleResultsWithServer.SUCCESS && (
                    <Grid item xs={12}>
                        <Tooltip title="Send profiles to the server" enterDelay={3000}>
                            <span>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    fullWidth
                                    onClick={sendProfiles}
                                    disabled={
                                        associationWithServerStatus != PossibleResultsWithServer.SUCCESS
                                        || profilesSendingStatus == PossibleResultsWithServer.IS_LOADING
                                    }
                                    startIcon={profilesSendingStatus == PossibleResultsWithServer.IS_LOADING ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                >
                                    Send Profiles
                                </Button>
                            </span>
                        </Tooltip>
                    </Grid>
                )}


                <Grid item xs={12} container justifyContent="center" alignItems="center">
                    {profilesSendingStatus == PossibleResultsWithServer.SUCCESS && (
                        <>
                            <CheckCircleOutlineIcon color="success" />
                            <Typography variant="body1" color="success.main" style={{ marginLeft: '1rem' }}>Profiles Created Successfully</Typography>
                        </>
                    )}
                    {profilesSendingStatus == PossibleResultsWithServer.FAILED && (
                        <>
                            <ErrorOutlineIcon color="error" />
                            <Typography variant="body1" color="error.main" style={{ marginLeft: '1rem' }}>Profiles Creation Failed</Typography>
                        </>
                    )}
                </Grid>

                <Grid item xs={12}>
                    <Tooltip title="Send permissions to the server" enterDelay={3000}>
                        <span>
                            <Button
                                variant="contained"
                                color="secondary"
                                fullWidth
                                onClick={sendPermissions}
                                disabled={
                                    associationWithServerStatus != PossibleResultsWithServer.SUCCESS
                                    || profilesSendingStatus != PossibleResultsWithServer.SUCCESS
                                    || permissionsSendingStatus == PossibleResultsWithServer.IS_LOADING
                                    || permissionsSendingStatus == PossibleResultsWithServer.SUCCESS
                                }
                                startIcon={permissionsSendingStatus == PossibleResultsWithServer.IS_LOADING ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                            >
                                Send Permissions
                            </Button>
                        </span>
                    </Tooltip>
                </Grid>
                </Grid>
        </Container>
    )
}

export default InitialSetup;