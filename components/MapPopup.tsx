import React from 'react';
import { MapPin, X, Globe, ExternalLink } from 'lucide-react';

interface MapPopupProps {
    locationName: string;
    locationCoords?: { latitude: number; longitude: number };
    onClose: () => void;
}

const MapPopup: React.FC<MapPopupProps> = ({ locationName, locationCoords, onClose }) => {
    return (
        <>
            <div className="absolute inset-0 z-[80] bg-black/20 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); onClose(); }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] bg-card border border-white/10 rounded-2xl w-64 h-80 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-3 bg-black/40 border-b border-white/5 relative z-10">
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-primary" />
                        <span className="text-xs font-bold text-white max-w-[150px] truncate">{locationName}</span>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={14} className="text-white" /></button>
                </div>

                {/* Map Container with Cropping to hide UI elements */}
                <div className="flex-1 bg-gray-900 relative overflow-hidden group">
                    {locationCoords ? (
                        <div className="absolute inset-[-50px] w-[calc(100%+100px)] h-[calc(100%+80px)]">
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight={0}
                                marginWidth={0}
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${locationCoords.longitude - 0.005}%2C${locationCoords.latitude - 0.005}%2C${locationCoords.longitude + 0.005}%2C${locationCoords.latitude + 0.005}&layer=mapnik&marker=${locationCoords.latitude}%2C${locationCoords.longitude}`}
                                className="w-full h-full"
                                style={{
                                    filter: "grayscale(100%) invert(90%) sepia(20%) saturate(500%) hue-rotate(65deg) brightness(0.9) contrast(1.2)"
                                }}
                            />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-4 text-center">
                            <Globe size={32} className="mb-2 opacity-50" />
                            <p className="text-xs font-bold">Map unavailable for this location.</p>
                        </div>
                    )}

                    <div className="absolute bottom-3 right-3">
                        <a
                            href={locationCoords ? `https://www.google.com/maps/search/?api=1&query=${locationCoords.latitude},${locationCoords.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary/20 backdrop-blur-md border border-primary/50 text-primary p-2 rounded-full shadow-lg flex items-center justify-center hover:bg-primary hover:text-black transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink size={14} />
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MapPopup;
