import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Grid,
  Typography,
  CircularProgress,
  Box,
  Tooltip
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SendIcon from '@mui/icons-material/Send';
import ActivityButton from '@mui/icons-material/LocalActivity';
import withSetupValidation from '@/higherOrderComponents/withSetupValidation';

const SetupPage = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('');
  const [checking, setChecking] = useState(false);
  const [reachable, setReachable] = useState(null);

  const handleIpAddressChange = (event) => {
    setIpAddress(event.target.value);
    setReachable(null);
  };

  const handlePortChange = (event) => {
    setPort(event.target.value);
    setReachable(null);
  };

  const checkServerReachability = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isReachable = Math.random() < 0.5;
        resolve(isReachable);
      }, 2000);
    });
  };

  const handleSubmit = () => {
    setChecking(true);
    checkServerReachability().then((isReachable) => {
      setReachable(isReachable);
      setChecking(false);
    });
  };

  const sendProfiles = () => {
    console.log('Sending profiles to the server');
  };

  const sendPermissions = () => {
    console.log('Sending permissions to the server');
    localStorage.setItem('calendarSetupComplete', "true")
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Server Setup
        </Typography>
        <Typography variant="body1" gutterBottom>
          Enter the IP address and port of the server you wish to connect to. Use the buttons below to check if the server is reachable and to send data.
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="IP Address"
              variant="outlined"
              value={ipAddress}
              onChange={handleIpAddressChange}
              helperText="Format: XXX.XXX.XXX.XXX"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Port"
              type="number"
              variant="outlined"
              value={port}
              onChange={handlePortChange}
              helperText="Typically a value between 1024 and 65535"
            />
          </Grid>
          <Grid item xs={12}>
            <Tooltip title="Check the reachability of the specified server" enterDelay={3000}>
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleSubmit}
                  disabled={checking}
                  startIcon={checking ? <CircularProgress size={20} color="inherit" /> : <ActivityButton />}
                >
                  {checking ? 'Checking...' : 'Check Reachability'}
                </Button>
              </span>
            </Tooltip>
          </Grid>
          <Grid item xs={12} container justifyContent="center">
            {reachable !== null && (
              reachable ? <CheckCircleOutlineIcon color="success" /> : <ErrorOutlineIcon color="error" />
            )}
          </Grid>
          <Grid item xs={12}>
            <Tooltip title="Send profiles to the server" enterDelay={3000}>
              <span>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={sendProfiles}
                  disabled={!reachable || checking}
                  startIcon={<SendIcon />}
                >
                  Send Profiles
                </Button>
              </span>
            </Tooltip>
          </Grid>
          <Grid item xs={12}>
            <Tooltip title="Send permissions to the server" enterDelay={3000}>
              <span>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={sendPermissions}
                  disabled={!reachable || checking}
                  startIcon={<SendIcon />}
                >
                  Send Permissions
                </Button>
              </span>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
  
};

export default withSetupValidation(SetupPage);