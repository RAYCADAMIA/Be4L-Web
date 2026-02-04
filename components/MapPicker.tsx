import React, { useEffect, useRef, useState } from 'react';
import { Target, MapPin, Search, Navigation, X, ChevronRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MapPickerProps {
    onSelect: (coords: { latitude: number; longitude: number }, address: string) => void;
    onClose: () => void;
    readOnly?: boolean;
    initialCoords?: { latitude: number; longitude: number };
}

declare let google: any;

const MapPicker: React.FC<MapPickerProps> = ({ onSelect, onClose, readOnly, initialCoords }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMap = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const autocompleteRef = useRef<any>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [address, setAddress] = useState('Davao City, Philippines');
    const [searchQuery, setSearchQuery] = useState('');
    const [coords, setCoords] = useState<{ latitude: number; longitude: number }>(initialCoords || { latitude: 7.0707, longitude: 125.6087 });
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const checkGoogle = setInterval(() => {
            if (typeof google !== 'undefined') {
                setIsLoaded(true);
                clearInterval(checkGoogle);
            }
        }, 500);
        return () => clearInterval(checkGoogle);
    }, []);

    useEffect(() => {
        if (!isLoaded || !mapRef.current) return;

        // Initialize Map
        googleMap.current = new google.maps.Map(mapRef.current, {
            center: { lat: coords.latitude, lng: coords.longitude },
            zoom: 15,
            disableDefaultUI: true,
            styles: [
                { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                {
                    featureType: "administrative.locality",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#d59563" }],
                },
                {
                    featureType: "poi",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#d59563" }],
                },
                {
                    featureType: "poi.park",
                    elementType: "geometry",
                    stylers: [{ color: "#263c3f" }],
                },
                {
                    featureType: "poi.park",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#6b9a76" }],
                },
                {
                    featureType: "road",
                    elementType: "geometry",
                    stylers: [{ color: "#38414e" }],
                },
                {
                    featureType: "road",
                    elementType: "geometry.stroke",
                    stylers: [{ color: "#212a37" }],
                },
                {
                    featureType: "road",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#9ca5b3" }],
                },
                {
                    featureType: "road.highway",
                    elementType: "geometry",
                    stylers: [{ color: "#746855" }],
                },
                {
                    featureType: "road.highway",
                    elementType: "geometry.stroke",
                    stylers: [{ color: "#1f2835" }],
                },
                {
                    featureType: "road.highway",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#f3d19c" }],
                },
                {
                    featureType: "transit",
                    elementType: "geometry",
                    stylers: [{ color: "#2f3948" }],
                },
                {
                    featureType: "transit.station",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#d59563" }],
                },
                {
                    featureType: "water",
                    elementType: "geometry",
                    stylers: [{ color: "#17263c" }],
                },
                {
                    featureType: "water",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#515c6d" }],
                },
                {
                    featureType: "water",
                    elementType: "labels.text.stroke",
                    stylers: [{ color: "#17263c" }],
                },
            ],
            gestureHandling: 'greedy'
        });

        // Initialize Marker
        markerRef.current = new google.maps.Marker({
            position: { lat: coords.latitude, lng: coords.longitude },
            map: googleMap.current,
            draggable: !readOnly,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: "#2DD4BF",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#000",
                scale: 10,
            }
        });

        // Autocomplete Setup
        if (!readOnly && inputRef.current) {
            autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
                componentRestrictions: { country: "ph" },
                fields: ["address_components", "geometry", "name", "formatted_address"],
            });

            autocompleteRef.current.addListener("place_changed", () => {
                const place = autocompleteRef.current.getPlace();
                if (!place.geometry || !place.geometry.location) return;

                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                moveTo(lat, lng, place.name || place.formatted_address);
            });
        }

        // Draggable Fine-tune
        if (!readOnly) {
            google.maps.event.addListener(markerRef.current, 'dragend', () => {
                const pos = markerRef.current.getPosition();
                updateAddress(pos.lat(), pos.lng());
            });

            googleMap.current.addListener('click', (e: any) => {
                moveTo(e.latLng.lat(), e.latLng.lng());
            });
        }

        // Initial Address Update
        updateAddress(coords.latitude, coords.longitude);

    }, []);

    const moveTo = (lat: number, lng: number, label?: string) => {
        if (!googleMap.current || !markerRef.current) return;
        const pos = { lat, lng };
        googleMap.current.panTo(pos);
        markerRef.current.setPosition(pos);
        setCoords({ latitude: lat, longitude: lng });

        if (label) {
            setAddress(label);
        } else {
            updateAddress(lat, lng);
        }
    };

    const updateAddress = async (lat: number, lng: number) => {
        if (typeof google === 'undefined') return;
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            if (status === "OK" && results[0]) {
                setAddress(results[0].formatted_address);
                setCoords({ latitude: lat, longitude: lng });
            }
        });
    };

    const handleConfirm = () => {
        onSelect(coords, address);
    };

    const openInMaps = () => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`, '_blank');
    };

    return (
        <div className="w-full h-full flex flex-col relative overflow-hidden bg-[#0A0A0A]">
            <div className="flex-1 relative">
                <div ref={mapRef} className="absolute inset-0 z-0" />

                {!isLoaded && (
                    <div className="absolute inset-0 bg-[#0A0A0A] z-30 flex flex-col items-center justify-center gap-4">
                        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 animate-pulse">Syncing Satellite Data</p>
                    </div>
                )}

                {/* Search Bar - Only for Pickers */}
                {!readOnly && (
                    <div className="absolute top-4 left-4 right-4 z-[10]">
                        <div className="bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center px-4 shadow-2xl transition-all focus-within:border-primary/50">
                            <Search size={16} className="text-gray-500" />
                            <input
                                ref={inputRef}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Find sector..."
                                className="flex-1 h-12 bg-transparent text-[10px] text-white uppercase font-black italic outline-none px-4 placeholder-white/20"
                            />
                        </div>
                    </div>
                )}

                {/* Bottom Overlay for Selection */}
                <div className="absolute bottom-4 left-4 right-4 z-[10] flex flex-col gap-2">
                    <div className="bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-3xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
                            <MapPin size={18} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h4 className="text-[10px] font-black italic text-white uppercase tracking-tight truncate leading-tight">{address}</h4>
                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">
                                {readOnly ? 'Verified Sector' : 'Sector Identified'}
                            </p>
                        </div>

                        {readOnly ? (
                            <button
                                onClick={openInMaps}
                                className="px-5 h-10 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest italic rounded-xl active:scale-95 transition-all flex items-center gap-2"
                            >
                                Directions <ExternalLink size={14} />
                            </button>
                        ) : (
                            <button
                                onClick={handleConfirm}
                                className="px-6 h-10 bg-primary text-black font-black text-[10px] uppercase tracking-widest italic rounded-xl active:scale-95 transition-all flex items-center gap-2"
                            >
                                Set <Target size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-[20] w-12 h-12 bg-black/50 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-xl"
                >
                    <X size={20} />
                </button>
            )}
        </div>
    );
};

export default MapPicker;
