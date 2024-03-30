import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

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

const LocationModal = ({ locationEvents }) => {
    return (
        <MapContainer zoom={13} style={{ height: '400px', width: '100%' }}>
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
    );
};

export default LocationModal;
