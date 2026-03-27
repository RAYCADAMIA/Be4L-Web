import React, { useEffect, useRef } from 'react';
import { MapPin, X, Navigation, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MapPickerProps {
    initialCoords?: { latitude: number, longitude: number };
    onSelect: (coords: { latitude: number, longitude: number }, address: string) => void;
    onClose: () => void;
}

declare let L: any;

const MapPicker: React.FC<MapPickerProps> = ({ initialCoords, onSelect, onClose }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<any>(null);
    const markerRef = useRef<any>(null);

    useEffect(() => {
        if (!mapRef.current || !window.hasOwnProperty('L')) return;

        if (!leafletMap.current) {
            const defaultPos: [number, number] = initialCoords
                ? [initialCoords.latitude, initialCoords.longitude]
                : [7.0707, 125.6087]; // Davao City

            leafletMap.current = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView(defaultPos, 15);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19
            }).addTo(leafletMap.current);

            // Add marker if initial coords provided
            if (initialCoords) {
                const icon = L.divIcon({
                    className: 'selected-location-marker',
                    html: `<div class="w-10 h-10 flex items-center justify-center">
                             <div class="w-3 h-3 bg-[#2DD4BF] rounded-full shadow-[0_0_15px_#2DD4BF] border-2 border-black z-10"></div>
                           </div>`,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                });
                markerRef.current = L.marker(defaultPos, { icon }).addTo(leafletMap.current);
            }

            // Click listener for picker
            leafletMap.current.on('click', (e: any) => {
                const { lat, lng } = e.latlng;

                // Remove old marker
                if (markerRef.current) markerRef.current.remove();

                const icon = L.divIcon({
                    className: 'selected-location-marker',
                    html: `<div class="w-10 h-10 flex items-center justify-center">
                             <div class="w-3 h-3 bg-[#2DD4BF] rounded-full shadow-[0_0_15px_#2DD4BF] border-2 border-black z-10"></div>
                           </div>`,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                });

                markerRef.current = L.marker([lat, lng], { icon }).addTo(leafletMap.current);

                // Simulate address lookup (or just use coordinates as address placeholder)
                const mockAddr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                onSelect({ latitude: lat, longitude: lng }, mockAddr);
            });
        }
    }, [initialCoords, onSelect]);

    return (
        <div className="relative w-full h-full bg-[#05050A]">
            <div ref={mapRef} className="w-full h-full" />

            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-[1000] pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 pointer-events-auto">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Tap to pin location</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black transition-all active:scale-90 pointer-events-auto"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
                <button
                    onClick={onClose}
                    className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-[#2DD4BF] text-black text-[10px] font-black uppercase tracking-widest shadow-2xl pointer-events-auto active:scale-95 transition-all"
                >
                    <Check size={16} strokeWidth={3} />
                    Confirm Position
                </button>
            </div>

            <style>{`
                .leaflet-tile-pane {
                    /* Standard clean look */
                }
            `}</style>
        </div>
    );
};

export default MapPicker;
