import React, { useState } from "react";
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

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ActivityButton from "@mui/icons-material/LocalActivity";

import withSetupValidation from "@/higherOrderComponents/withSetupValidation";
import InitialSetup from "../../components/forPages/forSetupPage/InitialSetup/InitialSetup";
import PairingToExistingSetup from "../../components/forPages/forSetupPage/PairingToExistingSetup/PairingToExistingSetup";

import persistenceManager, {
    HttpProtocolType,
} from "@/data/PersistenceManager";
import networkManager from "@/Network/NetworkManager";

enum SetupOption {
    INITIAL_SETUP,
    PAIRING_TO_EXISTING_SETUP,
}

const SetupPage = () => {
    const [selectedOption, setSelectedOption] = useState<SetupOption>(
        SetupOption.INITIAL_SETUP
    );

    const [protocol, setProtocol] = useState<HttpProtocolType>(
        HttpProtocolType.http
    );
    const [ipAddress, setIpAddress] = useState("127.0.0.1");
    const [port, setPort] = useState("3000");
    const [reachable, setReachable] = useState(null);

    const [checkingServerReachability, setCheckingServerReachability] =
        useState(false);

    const checkServerReachability = () => {
        // setCheckingServerReachability(true);
        persistenceManager.setServerHttpMethod(protocol);
        persistenceManager.setServerIPAddress(ipAddress);
        persistenceManager.setServerPort(port);
        // localStorage.setItem('calendarSetupComplete', "true")
        networkManager
            .checkServerPresence()
            .then((isPresent) => {
                if (isPresent) {
                    console.log("Server is up and running");
                } else {
                    console.log("Server is down");
                }
                setReachable(isPresent == true);
            })
            .finally(() => {
                setCheckingServerReachability(false);
            });
    };

    const handleIpAddressChange = (event) => {
        setIpAddress(event.target.value);
        setReachable(null);
    };

    const handlePortChange = (event) => {
        setPort(event.target.value);
        setReachable(null);
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ my: 4 }}>
                <Grid container spacing={2} sx={{ my: 4 }}>
                    <Typography
                        variant="h4"
                        gutterBottom
                        paddingBottom={3}
                        margin={0}
                    >
                        Server Setup
                    </Typography>

                    <Grid item xs={12}>
                        <Select
                            labelId="protocol-select-label"
                            label="Protocol"
                            id="protocol-select"
                            value={protocol}
                            onChange={(
                                event: SelectChangeEvent<HttpProtocolType>
                            ) => setProtocol(event.target.value)}
                            disabled={reachable == true}
                        >
                            <MenuItem value={HttpProtocolType.http}>
                                HTTP
                            </MenuItem>
                            <MenuItem value={HttpProtocolType.https}>
                                HTTPS
                            </MenuItem>
                        </Select>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="IP Address"
                            variant="outlined"
                            value={ipAddress}
                            onChange={handleIpAddressChange}
                            helperText="Format: XXX.XXX.XXX.XXX"
                            disabled={reachable == true}
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
                            disabled={reachable == true}
                        />
                    </Grid>
                    {(reachable == null || reachable == false) && (
                        <Grid item xs={12}>
                            <Tooltip
                                title="Check the reachability of the specified server"
                                enterDelay={3000}
                            >
                                <span>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        onClick={checkServerReachability}
                                        disabled={checkingServerReachability}
                                        startIcon={
                                            checkingServerReachability ? (
                                                <CircularProgress
                                                    size={20}
                                                    color="inherit"
                                                />
                                            ) : (
                                                <ActivityButton />
                                            )
                                        }
                                    >
                                        {checkingServerReachability
                                            ? "Checking..."
                                            : "Check Reachability"}
                                    </Button>
                                </span>
                            </Tooltip>
                        </Grid>
                    )}

                    <Grid
                        item
                        xs={12}
                        container
                        justifyContent="center"
                        alignItems="center"
                    >
                        {reachable && (
                            <>
                                <CheckCircleOutlineIcon color="success" />
                                <Typography
                                    variant="body1"
                                    color="success.main"
                                    style={{ marginLeft: "1rem" }}
                                >
                                    Server Reachable
                                </Typography>
                            </>
                        )}
                        {reachable != null && reachable == false && (
                            <>
                                <ErrorOutlineIcon color="error" />
                                <Typography
                                    variant="body1"
                                    color="error.main"
                                    style={{ marginLeft: "1rem" }}
                                >
                                    Server not reachable
                                </Typography>
                            </>
                        )}
                    </Grid>
                </Grid>

                {reachable && (
                    <>
                        <ToggleButtonGroup
                            color="primary"
                            value={selectedOption}
                            exclusive
                            onChange={(event, newOption) =>
                                setSelectedOption(newOption)
                            }
                            fullWidth
                            style={{ marginBottom: "2rem" }}
                        >
                            <ToggleButton value={SetupOption.INITIAL_SETUP}>
                                Initial Setup
                            </ToggleButton>
                            <ToggleButton
                                value={SetupOption.PAIRING_TO_EXISTING_SETUP}
                            >
                                Pairing to Existing Setup
                            </ToggleButton>
                        </ToggleButtonGroup>

                        {selectedOption == SetupOption.INITIAL_SETUP && (
                            <InitialSetup />
                        )}

                        {selectedOption ==
                            SetupOption.PAIRING_TO_EXISTING_SETUP && (
                            <PairingToExistingSetup />
                        )}
                    </>
                )}
            </Box>
        </Container>
    );
};

export default withSetupValidation(SetupPage);
