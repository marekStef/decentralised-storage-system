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

import persistenceManager from "@/data/PersistenceManager";

const AppsCategoriesHandler = (params) => {
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryColor, setNewCategoryColor] = useState("#FFFFFF");

    const handleAddCategory = () => {
        params.setCategories((oldCategories) => ({
            ...oldCategories,
            [newCategoryName]: { color: newCategoryColor },
        }));
        persistenceManager.setSavedWindowsAppsCategories({
            ...params.categories,
            [newCategoryName]: { color: newCategoryColor },
        });

        setNewCategoryName("");
        setNewCategoryColor("#FFFFFF");
    };

    const handleDeleteCategory = (categoryName) => {
        const { [categoryName]: _, ...rest } = params.categories;
        params.setCategories(rest);
        persistenceManager.setSavedWindowsAppsCategories(rest);
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Category Name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Category Color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    type="color"
                />
            </Grid>
            <Grid item xs={12}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddCategory}
                >
                    Add Category
                </Button>
            </Grid>
            <Grid item xs={12}>
                <List>
                    {Object.entries(params.categories).map(
                        ([name, { color }], index) => (
                            <ListItem
                                key={index}
                                sx={{
                                    backgroundColor: color,
                                    color: darken(0.4, color),
                                    borderRadius: "8px",
                                    margin: "10px 0",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    transition: "box-shadow 0.2s ease-in-out",
                                }}
                            >
                                <ListItemText
                                    primary={name}
                                    secondary={color}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={() =>
                                            handleDeleteCategory(name)
                                        }
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        )
                    )}
                </List>
            </Grid>
        </Grid>
    );
};

export default AppsCategoriesHandler;
