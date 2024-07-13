import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogActions, Button, DialogContent, DialogContentText } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DayOfWeek } from '@/data/SelectedWeek';
import persistenceManager from '@/data/PersistenceManager';
import networkManager from '@/Network/NetworkManager';
import { showError } from '@/components/AlertProvider/AlertProvider';

interface LocationModalParams {
    open: boolean,
    handleClose: () => void,
    selectedDay: DayOfWeek | null
}

interface ILocationEvent {
    payload: {
        id: number,
        accuracy: number,
        latitude: number,
        longitude: number,
        time: string
    }
}

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
function AutoAdjustBounds({ locationEvents }: { locationEvents: ILocationEvent[] }) {
    const map = useMap();

    useEffect(() => {
        if (locationEvents.length > 0) {
            let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;

            locationEvents.forEach((event: ILocationEvent) => {
                const { latitude, longitude } = event.payload;
                if (latitude < minLat) minLat = latitude;
                if (longitude < minLng) minLng = longitude;
                if (latitude > maxLat) maxLat = latitude;
                if (longitude > maxLng) maxLng = longitude;
            });

            const bounds: L.LatLngBoundsExpression = [
                [minLat, minLng], // South West
                [maxLat, maxLng]  // North East
            ];
            
            map.fitBounds(bounds);
        }
    }, [locationEvents, map]);

    return null;
}

const LocationModal: React.FC<LocationModalParams> = ({ open, handleClose, selectedDay }) => {
    const [isAndroidLocationsViewInstanceProperlySetup, setIsAndroidLocationsViewInstanceProperlySetup] = useState(false);
    const [locationEvents, setLocations] = useState<ILocationEvent[]>([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(true);

    const loadLocations = () => {
        const viewInstanceAccessTokenForAndroidLocationsData = persistenceManager.getViewInstanceAccessTokenForAndroidLocations();
        if (viewInstanceAccessTokenForAndroidLocationsData == null)
            return showError("Your app does not have token saved for executing remote view instance about windows apps");

        networkManager.executeViewInstance(viewInstanceAccessTokenForAndroidLocationsData, { selectedDateInISO: selectedDay?.dayInUTC } )
            .then(result => {
                if (result.code != 200) {
                    return showError(result.message);
                }
                // console.log(result);
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

                        <MapContainer 
                            center={[0, 0]} 
                            zoom={13} 
                            style={{ height: '400px', width: '100%' }} 
                            // whenReady={(mapInstance: any) => {
                            //     if (locationEvents.length > 0) {

                            //         const bounds = locationEvents.map(event => [event.payload.latitude, event.payload.longitude]);

                            //         mapInstance.fitBounds(bounds);
                            //     }
                            // }}
                            
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {locationEvents.map((event, index) => (
                                <Marker
                                    key={index}
                                    position={[event.payload.latitude, event.payload.longitude]}
                                    icon={defaultIcon}
                                >
                                    <Popup>
                                        Time: {formatLocalTime(event.payload.time)}
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
