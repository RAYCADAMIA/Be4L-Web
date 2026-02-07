import React from 'react';
import SmartMap from './ui/SmartMap';

interface MapPickerProps {
    onSelect: (coords: { latitude: number; longitude: number }, address: string) => void;
    onClose: () => void;
    readOnly?: boolean;
    initialCoords?: { latitude: number; longitude: number };
}

const MapPicker: React.FC<MapPickerProps> = ({ onSelect, onClose, readOnly, initialCoords }) => {
    return (
        <SmartMap
            mode={readOnly ? 'view' : 'select'}
            initialLocation={initialCoords ? {
                lat: initialCoords.latitude,
                lng: initialCoords.longitude
            } : undefined}
            onChange={(data) => {
                onSelect(
                    { latitude: data.coordinates[0], longitude: data.coordinates[1] },
                    data.locationName || data.formattedAddress
                );
            }}
            onClose={onClose}
            height="100%"
            className="w-full h-full"
        />
    );
};

export default MapPicker;
