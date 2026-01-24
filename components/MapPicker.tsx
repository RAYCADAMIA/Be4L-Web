import React, { useEffect, useRef, useState } from 'react';
import { Target, MapPin, Search, Navigation, X, ChevronRight, Direction } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MapPickerProps {
    onSelect: (coords: { latitude: number; longitude: number }, address: string) => void;
    onClose: () => void;
}

declare let L: any;

const MapPicker: React.FC<MapPickerProps> = ({ onSelect, onClose }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [address, setAddress] = useState('Davao City, Philippines');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({ latitude: 7.0707, longitude: 125.6087 });
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!mapRef.current || !window.hasOwnProperty('L')) return;

        if (!leafletMap.current) {
            leafletMap.current = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView([coords.latitude, coords.longitude], 15);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19
            }).addTo(leafletMap.current);

            const customIcon = L.divIcon({
                className: 'custom-picker-marker',
                html: `<div class="relative w-12 h-12 flex items-center justify-center">
                         <div class="absolute inset-0 bg-[#CCFF00]/20 rounded-full animate-ping"></div>
                         <div class="w-5 h-5 bg-[#CCFF00] rounded-full border-[3px] border-black z-10 shadow-[0_0_20px_#CCFF00]"></div>
                       </div>`,
                iconSize: [48, 48],
                iconAnchor: [24, 24]
            });

            markerRef.current = L.marker([coords.latitude, coords.longitude], {
                icon: customIcon,
                draggable: true
            }).addTo(leafletMap.current);

            leafletMap.current.on('click', (e: any) => {
                const { lat, lng } = e.latlng;
                moveTo(lat, lng);
            });

            markerRef.current.on('dragend', () => {
                const position = markerRef.current.getLatLng();
                setCoords({ latitude: position.lat, longitude: position.lng });
                updateAddress(position.lat, position.lng);
            });
        }
    }, []);

    const moveTo = (lat: number, lng: number, zoom = 16) => {
        if (!markerRef.current || !leafletMap.current) return;
        markerRef.current.setLatLng([lat, lng]);
        leafletMap.current.setView([lat, lng], zoom);
        setCoords({ latitude: lat, longitude: lng });
        updateAddress(lat, lng);
    };

    const updateAddress = async (lat: number, lng: number) => {
        try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await resp.json();
            const name = data.address.poi || data.address.building || data.address.road || data.display_name.split(',')[0];
            setAddress(name || 'Selected Location');
        } catch (e) {
            setAddress('Location Selected');
        }
    };

    const handleSearch = async () => {
        if (!searchQuery) return;
        setIsSearching(true);
        try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ' Davao')}&limit=5`);
            const data = await resp.json();
            setSearchResults(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectResult = (result: any) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        moveTo(lat, lon, 17);
        setAddress(result.display_name.split(',')[0]);
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleConfirm = () => {
        onSelect(coords, address);
    };

    return (
        <div className="absolute inset-0 z-[200] bg-[#070707] flex flex-col pt-12">
            {/* Minimalist Map Header */}
            <div className="px-6 pb-6 flex justify-between items-center">
                <div className="flex flex-col">
                    <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Sector Ops</h3>
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Pinpoint Mission Zone</span>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 relative">
                <div ref={mapRef} className="absolute inset-0" />

                {/* Search Bar Integration */}
                <div className="absolute top-6 left-6 right-6 z-[210] space-y-2">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl flex items-center px-4 shadow-2xl transition-all focus-within:border-primary/50">
                        <Search size={18} className="text-gray-700" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search facility or area..."
                            className="flex-1 h-16 bg-transparent text-xs text-white uppercase font-black italic outline-none px-4 placeholder-white/5"
                        />
                        {searchQuery && (
                            <button onClick={handleSearch} className="text-primary font-black text-[10px] uppercase tracking-widest pl-2">Find</button>
                        )}
                    </div>

                    <AnimatePresence>
                        {searchResults.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-3xl"
                            >
                                {searchResults.map((res: any) => (
                                    <button
                                        key={res.place_id}
                                        onClick={() => handleSelectResult(res)}
                                        className="w-full p-4 border-b border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-600">
                                            <MapPin size={14} />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-[11px] font-black text-white uppercase truncate">{res.display_name.split(',')[0]}</p>
                                            <p className="text-[8px] font-bold text-gray-700 uppercase truncate">{res.display_name.split(',').slice(1).join(',').trim()}</p>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-900" />
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom Place Info (Reflective of Gmaps reference) */}
                <div className="absolute bottom-10 left-6 right-6 z-[210] space-y-4">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 shadow-3xl flex items-center gap-4 relative overflow-hidden backdrop-blur-xl">
                        <div className="absolute top-0 right-0 p-3">
                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 flex items-center gap-2">
                                <Navigation size={10} className="text-primary" />
                                <span className="text-[9px] font-black text-gray-600 uppercase">Directions</span>
                            </div>
                        </div>

                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
                            <MapPin size={24} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h4 className="text-lg font-black italic text-white uppercase tracking-tight truncate leading-tight mb-1">{address}</h4>
                            <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest truncate">Zone Verified • Davao Sector</p>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="w-full h-20 bg-white text-black font-black uppercase tracking-[0.3em] italic rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] active:scale-95 transition-all text-sm flex items-center justify-center gap-4 group"
                    >
                        Establish Sector <Target size={22} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MapPicker;
