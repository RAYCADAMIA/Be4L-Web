import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation, ExternalLink } from 'lucide-react';
import { GlassCard } from './AestheticComponents';
import { useTheme } from '@/contexts/ThemeContext';

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    locationName: string;
    googleMapsLink: string;
}

export const LocationModal: React.FC<LocationModalProps> = ({
    isOpen,
    onClose,
    locationName,
    googleMapsLink
}) => {
    const { theme } = useTheme();
    const isSunrise = theme === 'sunrise';

    // Simple heuristic to extract something that looks like an address or query for GMaps IFrame
    // If it's a full link, we can try to extract the query 'q=' or just use the location name
    const getEmbedUrl = () => {
        // Use the location name as a query if it's specific enough
        const query = encodeURIComponent(locationName || 'Davao City');
        return `https://maps.google.com/maps?q=${query}&output=embed&z=15`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl z-10"
                    >
                        <GlassCard className={`overflow-hidden border shadow-2xl ${isSunrise ? 'bg-white/95 border-orange-500/20' : 'bg-zinc-900/90 border-white/10'}`}>
                            {/* Header */}
                            <div className={`p-6 flex items-center justify-between border-b ${isSunrise ? 'border-orange-500/10' : 'border-white/5'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSunrise ? 'bg-orange-500/10 text-orange-600' : 'bg-electric-teal/10 text-electric-teal'}`}>
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-black uppercase tracking-tight ${isSunrise ? 'text-[#1A1A1A]' : 'text-white'}`}>
                                            {locationName || 'Location'}
                                        </h3>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isSunrise ? 'text-orange-950/40' : 'text-gray-500'}`}>
                                            Brand Location
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSunrise ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        <Navigation size={12} />
                                        Get Directions
                                    </a>
                                    <button
                                        onClick={onClose}
                                        className={`p-2 rounded-xl transition-all ${isSunrise ? 'text-orange-950/40 hover:bg-orange-500/10 hover:text-orange-600' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Map Iframe Container */}
                            <div className="relative aspect-video w-full bg-black/20">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    scrolling="no"
                                    marginHeight={0}
                                    marginWidth={0}
                                    src={getEmbedUrl()}
                                    className={`${isSunrise ? 'grayscale-0' : 'grayscale-[0.8] invert-[0.9] hue-rotate-[180deg] brightness-[0.8] contrast-[1.2]'}`}
                                    style={{ border: 0 }}
                                />
                                {/* Bottom Accent */}
                                <div className={`absolute bottom-0 left-0 right-0 h-1 ${isSunrise ? 'bg-orange-500' : 'bg-electric-teal shadow-[0_0_15px_rgba(45,212,191,0.5)]'}`} />
                            </div>

                            {/* Mobile Footer Actions */}
                            <div className="md:hidden p-4">
                                <a
                                    href={googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-full flex items-center justify-center gap-2 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isSunrise ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white/10 text-white border border-white/10'}`}
                                >
                                    <Navigation size={14} />
                                    View in Google Maps
                                </a>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
