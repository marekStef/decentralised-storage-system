import React from 'react';
import dynamic from 'next/dynamic';

const LocationModalWithNoSSR = dynamic(
  () => import('@/components/forPages/androidLocationsSpecific/LocationModal'),
  { ssr: false }
);

const AndroidLocationsSettingsPage = () => {
    return <>
        <h1>Android Locations Settings Page</h1>
        <LocationModalWithNoSSR // it needs to be no ssr as the library tried to access window on the server - which of course does not work as the window variable is in browser only
            locationEvents={[{ latitude: 50.0255, longitude: 14.278, createdDate: '2024-03-30T12:30:00Z' }, { latitude: 52.2755, longitude: 12.43278, createdDate: '2024-03-30T12:30:00Z' }, { latitude: 48.0255, longitude: 8.428, createdDate: '2024-03-30T12:30:00Z' }]} />

    </>
};

export default AndroidLocationsSettingsPage;