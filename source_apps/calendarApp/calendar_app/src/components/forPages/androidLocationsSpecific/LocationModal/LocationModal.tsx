import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogActions, Button, DialogContent, DialogContentText } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DayOfWeek } from '@/data/SelectedWeek';
import persistenceManager from '@/data/PersistenceManager';
import networkManager from '@/Network/NetworkManager';
import { showError } from '@/components/AlertProvider/AlertProvider';

const defaultIcon = L.icon({
    iconUrl: '/images/leaflet/marker-icon.png',
    shadowUrl: '/images/leaflet/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const formatLocalTime = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleTimeString();
};

// hook to automatically adjust map bounds
function AutoAdjustBounds({ locationEvents }) {
    const map = useMap();

    useEffect(() => {
        if (locationEvents.length > 0) {
            const bounds = locationEvents.map(event => [event.latitude, event.longitude]);
            map.fitBounds(bounds);
        }
    }, [locationEvents, map]);

    return null;
}

interface LocationModalParams {
    open: boolean,
    handleClose: () => void,
    selectedDay: DayOfWeek | null
}

const LocationModal: React.FC<LocationModalParams> = ({ open, handleClose, selectedDay }) => {
    const [isAndroidLocationsViewInstanceProperlySetup, setIsAndroidLocationsViewInstanceProperlySetup] = useState(false);
    const [locationEvents, setLocations] = useState([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(true);

    const loadLocations = () => {
        const viewInstanceAccessTokenForAndroidLocationsData = persistenceManager.getViewInstanceAccessTokenForAndroidLocations();
        if (viewInstanceAccessTokenForAndroidLocationsData == null)
            return showError("Your app does not have token saved for executing remote view instance about windows apps");

        networkManager.executeViewInstance(viewInstanceAccessTokenForAndroidLocationsData, { selectedDateInISO: selectedDay?.dayInUTC } )
            .then(result => {
                console.log(result);
                if (result.code != 200) {
                    return showError(result.message);
                }
                setLocations(result.locations);
                setIsLoadingLocations(false);
            })
            .catch(err => {
                console.log(err);
            })
    }

    useEffect(() => {
        if (!open) return;

        if (persistenceManager.getViewInstanceAccessTokenForAndroidLocations() == null) {
            setIsAndroidLocationsViewInstanceProperlySetup(false);
            setIsLoadingLocations(false);
            return;
        }

        setIsAndroidLocationsViewInstanceProperlySetup(true);

        loadLocations();
    }, [open])

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="location-dialog-title"
            fullWidth
            maxWidth="md"
        >
            {isAndroidLocationsViewInstanceProperlySetup ? (
                <>
                    <DialogTitle id="location-dialog-title">Location Details For {selectedDay?.date.toLocaleDateString()} ({selectedDay?.dayName})</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{my: 2}}>{locationEvents.length} location events</DialogContentText>

                        <MapContainer center={[0, 0]} zoom={13} style={{ height: '400px', width: '100%' }} whenCreated={mapInstance => {
                            if (locationEvents.length > 0) {
                                const bounds = locationEvents.map(event => [event.latitude, event.longitude]);
                                mapInstance.fitBounds(bounds);
                            }
                        }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {locationEvents.map((event, index) => (
                                <Marker
                                    key={index}
                                    position={[event.latitude, event.longitude]}
                                    icon={defaultIcon}
                                >
                                    <Popup>
                                        Time: {formatLocalTime(event.createdDate)}
                                    </Popup>
                                </Marker>
                            ))}
                            <AutoAdjustBounds locationEvents={locationEvents} />
                        </MapContainer>
                    </DialogContent>
                </>
            ) : (
                <>
                    <DialogTitle id="location-dialog-title">Android Locations View Instance Not Set Up</DialogTitle>
                    <DialogContent>
                        <DialogContentText>You need to set it up in the Android Locations Settings</DialogContentText>
                    </DialogContent>
                </>
            )}

            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default LocationModal;
