import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Navigation, X, ExternalLink, Map as MapIcon, Loader2, ChevronRight, ArrowLeft, Locate, Check } from 'lucide-react';
import { GlassCard, GradientButton } from './AestheticComponents';

interface SmartMapProps {
    mode: 'select' | 'view';
    initialLocation?: {
        lat: number;
        lng: number;
        placeName?: string;
        formattedAddress?: string;
    };
    onChange?: (data: {
        locationName: string;
        formattedAddress: string;
        coordinates: [number, number];
    }) => void;
    onClose?: () => void;
    className?: string;
    height?: string | number;
}

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export const SmartMap: React.FC<SmartMapProps> = ({
    mode,
    initialLocation,
    onChange,
    onClose,
    className = "",
    height = "400px"
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<any>(null);
    const markerRef = useRef<any>(null);

    const [coords, setCoords] = useState<[number, number]>(() => {
        if (initialLocation && typeof initialLocation.lat === 'number' && typeof initialLocation.lng === 'number') {
            return [initialLocation.lat, initialLocation.lng];
        }
        return [7.0707, 125.6087]; // Default to Davao
    });
    const [placeName, setPlaceName] = useState(initialLocation?.placeName || '');
    const [address, setAddress] = useState(initialLocation?.formattedAddress || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Initialize Map
    useEffect(() => {
        if (!mapRef.current || !window.hasOwnProperty('L')) return;

        // Cleanup existing map if present (safety check)
        if (leafletMap.current) {
            leafletMap.current.remove();
            leafletMap.current = null;
        }

        if (!leafletMap.current) {
            leafletMap.current = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false,
                dragging: true,
                touchZoom: true,
                scrollWheelZoom: true,
            }).setView(coords, 15);

            // Base layer with no labels to avoid overlap if we add labels on top
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
                maxZoom: 20,
                subdomains: 'abcd'
            }).addTo(leafletMap.current);

            // Add labels layer on top for high visibility
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
                maxZoom: 20,
                subdomains: 'abcd',
                zIndex: 1000 // Higher z-index to stay above markers if desired, though labels should usually be below markers but above the base map
            }).addTo(leafletMap.current);

            // Custom Marker Icon (Modern Pin)
            const customIcon = L.divIcon({
                className: 'custom-map-marker',
                html: `<div class="relative">
                         <div class="absolute w-12 h-12 bg-electric-teal/20 rounded-full animate-ping -translate-x-1/2 -translate-y-1/2"></div>
                         <div class="relative -translate-x-1/2 -translate-y-[90%]">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]">
                                <path d="M12 21C16 17.5 20 13.4357 20 9.5C20 5.08172 16.4183 1.5 12 1.5C7.58172 1.5 4 5.08172 4 9.5C4 13.4357 8 17.5 12 21Z" fill="#2DD4BF" stroke="#000" stroke-width="1"/>
                                <circle cx="12" cy="9.5" r="3" fill="#000" fill-opacity="0.8"/>
                            </svg>
                         </div>
                       </div>`,
                iconSize: [40, 40],
                iconAnchor: [0, 0]
            });

            markerRef.current = L.marker(coords, {
                icon: customIcon,
                draggable: mode === 'select'
            }).addTo(leafletMap.current);

            // Add persistent tooltip in select mode
            if (mode === 'select' && placeName) {
                markerRef.current.bindTooltip(placeName, {
                    permanent: true,
                    direction: 'top',
                    className: 'custom-map-tooltip',
                    offset: [0, -35]
                }).openTooltip();
            }

            if (mode === 'select') {
                markerRef.current.on('dragend', (e: any) => {
                    const newPos = e.target.getLatLng();
                    handleLocationChange(newPos.lat, newPos.lng);
                });

                leafletMap.current.on('click', (e: any) => {
                    const { lat, lng } = e.latlng;
                    markerRef.current.setLatLng([lat, lng]);
                    handleLocationChange(lat, lng);
                });
            }

            // Invalidate size after a delay to ensure it fits the modal
            setTimeout(() => {
                leafletMap.current?.invalidateSize();
            }, 300);
        }

        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove();
                leafletMap.current = null;
            }
        };
    }, []);

    // Sync marker if coords change externally (initial load)
    useEffect(() => {
        if (markerRef.current && mode === 'view' && leafletMap.current) {
            // Safety check for valid coords
            if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
                markerRef.current.setLatLng(coords);
                leafletMap.current.setView(coords, 15);
            }
        }
    }, [coords, mode]);

    const handleLocationChange = async (lat: number, lng: number) => {
        setCoords([lat, lng]);
        setIsLoadingDetails(true);

        try {
            const MAPBOX_TOKEN = 'pk.eyJ1IjoiYmFkc2lybyIsImEiOiJjbWxiMjUwNXcwbDUyM2tvb2I3OHVvenZkIn0.SZLmnievNjWqKAzKUtxUYQ';
            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`);
            const data = await response.json();

            if (data && data.features && data.features.length > 0) {
                const feature = data.features[0];
                const name = feature.text; // Specific name like "Starbucks"
                const fullAddr = feature.place_name; // Full address

                setPlaceName(name);
                setAddress(fullAddr);

                if (markerRef.current && mode === 'select') {
                    markerRef.current.unbindTooltip();
                    markerRef.current.bindTooltip(name, {
                        permanent: true,
                        direction: 'top',
                        className: 'custom-map-tooltip',
                        offset: [0, -35]
                    }).openTooltip();
                }

                if (onChange) {
                    onChange({
                        locationName: name,
                        formattedAddress: fullAddr,
                        coordinates: [lat, lng]
                    });
                }
            }
        } catch (error) {
            console.error("Reverse geocoding failed", error);
        } finally {
            setIsLoadingDetails(false);
        }
    };



    const searchLocations = async (query: string) => {
        setIsSearching(true);
        setShowResults(true);
        try {
            const MAPBOX_TOKEN = 'pk.eyJ1IjoiYmFkc2lybyIsImEiOiJjbWxiMjUwNXcwbDUyM2tvb2I3OHVvenZkIn0.SZLmnievNjWqKAzKUtxUYQ';
            // Search with broader criteria (removed rigid types) and fuzzy matching to mimic GMaps behavior
            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&fuzzyMatch=true&autocomplete=true&limit=10&country=ph&proximity=${coords[1]},${coords[0]}`);
            const data = await response.json();
            setSearchResults(data.features || []);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced Search Effect (Placed here to ensure searchLocations is defined)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            // 1. Check for Google Maps Link Magic Paste
            if (searchQuery.includes('google.com/maps') || searchQuery.includes('goo.gl')) {
                // Try to extract coordinates from URL pattern: @lat,lng
                const coordsMatch = searchQuery.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (coordsMatch) {
                    const lat = parseFloat(coordsMatch[1]);
                    const lng = parseFloat(coordsMatch[2]);
                    console.log("📍 Magic Link Detected:", lat, lng);

                    // Fly to location and Reverse Geocode
                    setCoords([lat, lng]);
                    setSearchQuery(''); // Clear the messy link
                    setShowResults(false);

                    if (leafletMap.current) {
                        leafletMap.current.flyTo([lat, lng], 18);
                        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
                    }

                    // Trigger reverse lookup to get the name
                    handleLocationChange(lat, lng);
                    return; // Stop normal search
                }
            }

            // 2. Normal Text Search
            if (searchQuery.length > 2) {
                searchLocations(searchQuery);
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSelectResult = (feature: any) => {
        // Mapbox: [lng, lat]
        const [lng, lat] = feature.center || feature.geometry.coordinates;

        // Mapbox formatting
        const name = feature.text; // Main name (e.g. "Starbucks")
        const fullAddr = feature.place_name; // Full string (e.g. "Starbucks, Davao City...")

        setCoords([lat, lng]);
        setPlaceName(name);
        setAddress(fullAddr);
        setSearchQuery('');
        setShowResults(false);

        if (leafletMap.current) {
            leafletMap.current.flyTo([lat, lng], 17); // Zoom closer for better precision
            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            }
        }

        if (onChange) {
            onChange({
                locationName: name,
                formattedAddress: fullAddr,
                coordinates: [lat, lng]
            });
        }
    };

    const viewOnGoogleMaps = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`;
        window.open(url, '_blank');
    };

    return (
        <div className={`relative flex flex-col gap-4 ${className}`} style={{ height }}>
            {/* Search Overlay (Only in Select Mode) */}
            {mode === 'select' && (
                <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-3">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-electric-teal/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <div className="relative flex items-center bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all focus-within:border-electric-teal/50">
                            <div className="pl-4 text-gray-400">
                                {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                            </div>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for a location (e.g. 'Starbucks Davao')..."
                                className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-gray-500 outline-none"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="pr-4 text-gray-500 hover:text-white">
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {showResults && searchResults.length > 0 && searchQuery && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-3xl max-h-60 overflow-y-auto z-[1001]"
                                >
                                    {searchResults.map((feature: any, i: number) => {
                                        // Mapbox format mapping
                                        const name = feature.text;
                                        // Creating a cleaner subtitle by removing the name from the full address if possible
                                        const details = feature.place_name.replace(feature.text + ', ', '');

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handleSelectResult(feature)}
                                                className="w-full px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left"
                                            >
                                                <MapPin size={16} className="text-electric-teal mt-1 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-white uppercase truncate">{name}</p>
                                                    <p className="text-[10px] text-gray-500 truncate">{details}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-2 pointer-events-none">
                        {onClose && (
                            <motion.button
                                onClick={onClose}
                                className="pointer-events-auto p-3.5 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 text-white shadow-xl hover:bg-white/10 transition-all flex items-center gap-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ArrowLeft size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest pr-1">Back</span>
                            </motion.button>
                        )}

                        <div className="flex-1" />

                        <motion.button
                            onClick={() => {
                                const target = initialLocation ? [initialLocation.lat, initialLocation.lng] : [7.0707, 125.6087];
                                leafletMap.current?.flyTo(target, 16);
                            }}
                            className="pointer-events-auto p-3.5 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 text-white shadow-xl hover:bg-white/10 hover:text-electric-teal transition-all flex items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Locate size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest pr-1">Recenter</span>
                        </motion.button>
                    </div>
                </div>
            )}



            {/* Map Container */}
            <div className="relative flex-1 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group">
                <div ref={mapRef} className="absolute inset-0 z-0 bg-black" />

                {/* Decorative Overlays */}
                <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.05]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #2DD4BF 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}
                />

                {/* View on GMaps Floating Button (View Mode Only) */}
                {mode === 'view' && (
                    <div className="absolute bottom-4 right-4 z-20">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={viewOnGoogleMaps}
                            className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-all shadow-xl"
                        >
                            <Navigation size={12} className="text-electric-teal" />
                            GMaps
                        </motion.button>
                    </div>
                )}

                {/* Loading Details Indicator */}
                <AnimatePresence>
                    {isLoadingDetails && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-30 bg-black/20 backdrop-blur-[2px] flex items-center justify-center"
                        >
                            <Loader2 className="animate-spin text-electric-teal" size={24} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Confirm Button (Select Mode) - Only show if onClose is provided (Modal Mode) */}
                {mode === 'select' && onClose && (
                    <div className="absolute bottom-6 left-6 right-6 z-[800]">
                        <GradientButton
                            className="w-full shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                            onClick={onClose}
                        >
                            <Check size={18} className="mr-2" />
                            Use This Location
                        </GradientButton>
                    </div>
                )}
            </div>

            {/* Location Details Bar - Removed as per request for simpler UI, except for View mode if needed, but User requested removal to utilize modal */}
            {mode === 'view' && (
                <div className="mt-auto">
                    <div className="flex flex-col gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-electric-teal shadow-[0_0_8px_#2DD4BF]" />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Selected Point</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-xl font-black uppercase text-white truncate leading-tight">{placeName || 'Unknown Location'}</h4>
                            <p className="text-[10px] text-gray-500 font-medium leading-relaxed line-clamp-1">{address || 'No address data found for this point.'}</p>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .leaflet-tile-pane {
                    /* filter: grayscale(80%) brightness(0.9) contrast(1.1) sepia(0.2) hue-rotate(150deg) saturate(1.8); */
                }
                .custom-map-marker {
                    z-index: 500 !important;
                }
                .custom-map-tooltip {
                    background: rgba(10, 10, 10, 0.9) !important;
                    border: 1px solid rgba(45, 212, 191, 0.3) !important;
                    border-radius: 12px !important;
                    color: white !important;
                    font-family: 'Inter', sans-serif !important;
                    font-size: 10px !important;
                    font-weight: 800 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em !important;
                    padding: 6px 12px !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
                }
                .leaflet-tooltip-top:before {
                    border-top-color: rgba(45, 212, 191, 0.3) !important;
                }
            `}</style>
        </div>
    );
};

export default SmartMap;
