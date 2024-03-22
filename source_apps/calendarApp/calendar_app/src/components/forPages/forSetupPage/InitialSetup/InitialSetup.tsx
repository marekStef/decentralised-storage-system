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
import GetAppIcon from '@mui/icons-material/GetApp';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SendIcon from '@mui/icons-material/UploadFileOutlined';
import AssociationIcon from '@mui/icons-material/ConnectWithoutContactOutlined';

import persistenceManager, { HttpProtocolType } from '@/data/PersistenceManager';
import appConstants from '@/constants/appConstants';

import { showSuccess, showError } from '@/components/AlertProvider/AlertProvider';
import Link from 'next/link';

enum PossibleResultsWithServer {
    NOT_TRIED,
    IS_LOADING,
    SUCCESS,
    FAILED
}

const InitialSetup = () => {
    const Router = useRouter();

    const [associationToken, setAssociationToken] = useState<string>('')

    const [associationWithServerStatus, setAssociationWithServerStatus] = useState<PossibleResultsWithServer>(PossibleResultsWithServer.NOT_TRIED);

    const [profilesSendingStatus, setProfilesSendingStatus] = useState<PossibleResultsWithServer>(PossibleResultsWithServer.NOT_TRIED);

    const [permissionsSendingStatus, setPermissionsSendingStatus] = useState<PossibleResultsWithServer>(PossibleResultsWithServer.NOT_TRIED);

    const [viewTemplateId, setViewTemplateId] = useState<string>('');
    const [viewInstanceSendingStatus, setViewInstanceSendingStatus] = useState<PossibleResultsWithServer>(PossibleResultsWithServer.NOT_TRIED);

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

    const createNewViewInstance = () => {
        if (viewInstanceSendingStatus == PossibleResultsWithServer.IS_LOADING || viewInstanceSendingStatus == PossibleResultsWithServer.SUCCESS) return;

        networkManager.createNewViewInstance(viewTemplateId)
            .then(response => {
                persistenceManager.setViewInstanceToken(response.viewInstanceToken);
                console.log('heeeere');
                console.log(response);
                showSuccess(response.message);
                setViewInstanceSendingStatus(PossibleResultsWithServer.SUCCESS);
                Router.replace('/');
            })
            .catch(errResponse => {
                setViewInstanceSendingStatus(PossibleResultsWithServer.FAILED);
                console.log(errResponse, 'heeeere');
                showError(errResponse.message);
            })
        // setViewInstanceSendingStatus(PossibleResultsWithServer.SUCCESS);
    }

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


                <Box sx={{ margin: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    <Typography variant="body1" sx={{ margin: '1rem' }}>
                        You need to create manually a new View Template in the Control Centre. Download the following two javascript files.
                    </Typography>

                    <Typography variant="body1" sx={{ margin: '1rem' }}>
                        In profiles section, you need to add
                        <Box component="span" sx={{
                            backgroundColor: 'grey.300',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            margin: '0.2rem'
                        }}>
                            {appConstants.calendarEventProfileName}
                        </Box> event and add all access rights ( R, W, D, M)
                    </Typography>


                    <Box display="flex" flexDirection="column" gap="0.5rem" alignItems="center">
                        <Button
                            variant="contained"
                            color="primary"
                            href="/calendarViewTemplateFunctions/main.js"
                            download
                            startIcon={<GetAppIcon />}
                        >
                            Download Main.js
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            href="/calendarViewTemplateFunctions/helpers.js"
                            download
                            startIcon={<GetAppIcon />}
                        >
                            Download Helpers.js
                        </Button>
                    </Box>
                </Box>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="View Template ID"
                        type="text"
                        variant="outlined"
                        value={viewTemplateId}
                        onChange={event => setViewTemplateId(event.target.value)}
                        helperText="You need to create View Template manually in the Control Centre and paste its ID here"
                        disabled={viewInstanceSendingStatus == PossibleResultsWithServer.SUCCESS}
                    />
                </Grid>

                {viewInstanceSendingStatus != PossibleResultsWithServer.SUCCESS && (
                    <Grid item xs={12}>
                        <Tooltip title="Create View Instance Based Off View Template" enterDelay={3000}>
                            <span>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    fullWidth
                                    onClick={createNewViewInstance}
                                    disabled={
                                        viewInstanceSendingStatus == PossibleResultsWithServer.IS_LOADING
                                    }
                                    startIcon={viewInstanceSendingStatus == PossibleResultsWithServer.IS_LOADING ? <CircularProgress size={20} color="inherit" /> : <AssociationIcon />}
                                >
                                    Create View Instance Based Off View Template
                                </Button>
                            </span>
                        </Tooltip>
                    </Grid>
                )}

                <Grid item xs={12} container justifyContent="center" alignItems="center">
                    {viewInstanceSendingStatus == PossibleResultsWithServer.SUCCESS && (
                        <>
                            <CheckCircleOutlineIcon color="success" />
                            <Typography variant="body1" color="success.main" style={{ marginLeft: '1rem' }}>View Instance Created</Typography>
                        </>
                    )}
                    {viewInstanceSendingStatus == PossibleResultsWithServer.FAILED && (
                        <>
                            <ErrorOutlineIcon color="error" />
                            <Typography variant="body1" color="error.main" style={{ marginLeft: '1rem' }}>View Instance Setup Failed</Typography>
                        </>
                    )}
                </Grid>
            </Grid>
        </Container>
    )
}

export default InitialSetup;