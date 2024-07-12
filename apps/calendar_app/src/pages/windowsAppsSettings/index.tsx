import React, { useEffect, useState } from "react";
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
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
} from "@mui/material";
import { darken, lighten } from "polished";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from 'next/router';

import persistenceManager from "@/data/PersistenceManager";

import Link from "next/link";
import networkManager from "@/Network/NetworkManager";
import { showError } from "@/components/AlertProvider/AlertProvider";
import AppsCategoriesHandler from "@/components/windowsAppsSpecific/AppsCategoriesHandler/AppsCategoriesHandler";

const WindowsAppsSettingsPage = () => {
    const Router = useRouter();

    const isWindowsAppsSetUpCorrectly = persistenceManager.getViewInstanceAccessTokenForWindowsAppsData() != null;
    const [isLoading, setIsLoading] = useState(false);
    const [uniqueExeNames, setUniqueExeNames] = useState([]);
    const [uniqueExeNamesWithAssignedCategories, setUniqueExeNamesWithAssginedCategories] = useState({});

    const [categories, setCategories] = useState({});

    const getWindowsAppsUniqueNamesList = () => {
        const viewInstanceAccessTokenForWindowsOpenedAppsUniqueNamesList = persistenceManager.getViewInstanceAccessTokenForWindowsAppsData();
        if (!viewInstanceAccessTokenForWindowsOpenedAppsUniqueNamesList) return;

        networkManager
            .executeViewInstance(
                viewInstanceAccessTokenForWindowsOpenedAppsUniqueNamesList,
                {
                    getUniqueApps: true
                }
            )
            .then((result) => {
                if (result.code != 200) {
                    return showError(result.message);
                }
                console.log(result);
                setUniqueExeNames(result.uniqueExeNames);
                setIsLoading(false);
            })
            .catch((err) => {
                console.log(err);
                showError(
                    "Something went wrong exeucting view instance for getting events"
                );
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        if (!isWindowsAppsSetUpCorrectly)
            return;
        getWindowsAppsUniqueNamesList();
        setUniqueExeNamesWithAssginedCategories(persistenceManager.getAppsWithAssignedCategories());
        setCategories(persistenceManager.getSavedWindowsAppsCategories());
    }, []);

    const handleAppCategoryChange = (appName, event) => {
        setUniqueExeNamesWithAssginedCategories(prev => {
            const newObject = { ...prev, [appName]: event.target.value };
            persistenceManager.setAppsWithAssignedCategories(newObject);
            return newObject;
        })

    };

    if (!isWindowsAppsSetUpCorrectly) {
        Router.push('/windowsAppsSettings/setup')
        return <></>
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography
                    variant="h4"
                    gutterBottom
                    paddingBottom={3}
                    margin={0}
                >
                    Windows Apps Categories
                </Typography>

                <Button
                        variant="contained"
                        color="primary"
                        href="/"
                    >
                        Go To Week's View
                </Button>

                <Typography
                    variant="h6"
                    gutterBottom
                    paddingBottom={3}
                    paddingTop={3}
                    margin={0}
                >
                    You can create your own categories here and assign them to certain applications below. These categories will be then visible in the main Week's View.
                </Typography>

                
                
                <AppsCategoriesHandler categories={categories} setCategories={setCategories} />

                <Grid>
                    <Grid>

                        <Grid item xs={12}>
                            <List>
                                {uniqueExeNames.map((appName, index) => (
                                    <ListItem key={index}>
                                        <ListItemText
                                            primary={appName}
                                            style={{
                                                wordWrap: 'break-word',
                                                padding: '0 1rem 0 0'
                                            }}
                                        />
                                        <Select
                                            value={uniqueExeNamesWithAssignedCategories[appName] || ""}
                                            onChange={(e) =>
                                                handleAppCategoryChange(appName, e)
                                            }
                                            displayEmpty
                                            inputProps={{
                                                "aria-label": "Without label",
                                            }}
                                            sx={{
                                                backgroundColor: categories[uniqueExeNamesWithAssignedCategories[appName]]?.color || '#ccc',
                                            }}
                                        >
                                            <MenuItem value="other">
                                                <em>other</em>
                                            </MenuItem>
                                            {Object.entries(categories).map(([name, { color }], index) => (
                                                <MenuItem
                                                    key={index}
                                                    value={name}
                                                    
                                                >
                                                    {name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </ListItem>
                                ))}
                            </List>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default WindowsAppsSettingsPage;
