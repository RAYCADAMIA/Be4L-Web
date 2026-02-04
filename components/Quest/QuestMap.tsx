import React, { useEffect, useRef, useState } from 'react';
import { Users, Zap, Target, X, ChevronRight, Trophy, MapPin, ExternalLink } from 'lucide-react';
import { Quest } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestMapProps {
    quests: Quest[];
    onQuestClick: (q: Quest) => void;
    isFull?: boolean;
}

declare let L: any; // Global Leaflet object from CDN

const QuestMap: React.FC<QuestMapProps> = ({ quests, onQuestClick, isFull = false }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

    useEffect(() => {
        if (!mapRef.current || !window.hasOwnProperty('L')) return;

        // Initialize map if not already done
        if (!leafletMap.current) {
            // Default to Davao City coordinates if no current location
            const defaultPos: [number, number] = [7.0707, 125.6087];

            leafletMap.current = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false,
                dragging: true,
                bounceAtZoomLimits: true
            }).setView(defaultPos, 14);

            // Restoring the "Precious" Dark Base Tile Layer (CartoDB Dark Matter)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19
            }).addTo(leafletMap.current);

            // User Location Marker - Tactical Lore
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        leafletMap.current.setView([latitude, longitude], 14);

                        const userIcon = L.divIcon({
                            className: 'user-location-marker',
                            html: `<div class="relative w-10 h-10 flex items-center justify-center">
                                     <div class="absolute inset-0 bg-[#2DD4BF]/10 rounded-full animate-ping"></div>
                                     <div class="w-2.5 h-2.5 bg-[#2DD4BF] rounded-full shadow-[0_0_15px_#2DD4BF] border-2 border-black z-10"></div>
                                   </div>`,
                            iconSize: [40, 40],
                            iconAnchor: [20, 20]
                        });
                        L.marker([latitude, longitude], { icon: userIcon }).addTo(leafletMap.current);
                    },
                    () => console.log('Geolocation denied')
                );
            }

            // Close popup on map click
            leafletMap.current.on('click', () => setSelectedQuest(null));
        }

        // Clear old markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Add Quest Markers
        quests.forEach(q => {
            if (!q.location_coords) return;

            // State Logic
            const startTime = new Date(q.start_time);
            const now = new Date();
            const timeDiff = startTime.getTime() - now.getTime();
            const minutesToStart = Math.floor(timeDiff / (1000 * 60));
            const isLive = q.status === 'ACTIVE';
            const isStartingSoon = !isLive && minutesToStart > 0 && minutesToStart <= 60;

            // Styles
            let borderClass = 'border-white/10';
            let shadowClass = '';
            let ringAnimation = '';

            if (isLive) {
                borderClass = 'border-red-500';
                shadowClass = 'shadow-[0_0_20px_rgba(239,68,68,0.4)]';
                ringAnimation = 'after:content-[""] after:absolute after:inset-[-4px] after:border after:border-red-500/50 after:rounded-full after:animate-ping';
            } else if (isStartingSoon) {
                borderClass = 'border-[#2DD4BF]/50';
                shadowClass = 'shadow-[0_0_15px_rgba(45,212,191,0.3)]';
            }

            const icon = L.divIcon({
                className: 'quest-map-marker',
                html: `<div class="relative group cursor-pointer active:scale-95 transition-transform duration-300">
                         <div class="relative w-12 h-12 rounded-full border ${borderClass} overflow-hidden ${shadowClass} bg-deep-black z-20">
                           <img src="${q.host_capture_url || q.host?.avatar_url || 'https://picsum.photos/100/100?random=' + q.id}" class="w-full h-full object-cover" />
                         </div>
                         <div class="${ringAnimation} z-10"></div>
                         ${isLive ? `<div class="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full z-30 animate-pulse">LIVE</div>` : ''}
                       </div>`,
                iconSize: [48, 48],
                iconAnchor: [24, 24]
            });

            const marker = L.marker([q.location_coords.latitude, q.location_coords.longitude], { icon })
                .addTo(leafletMap.current)
                .on('click', (e: any) => {
                    L.DomEvent.stopPropagation(e);
                    setSelectedQuest(q);
                    leafletMap.current.flyTo([q.location_coords!.latitude, q.location_coords!.longitude], 15, { duration: 0.5 });
                });

            markersRef.current.push(marker);
        });
    }, [quests]);

    useEffect(() => {
        if (leafletMap.current) {
            setTimeout(() => {
                leafletMap.current.invalidateSize();
            }, 500); // Wait for CSS transition
        }
    }, [isFull]);

    const handleLocate = () => {
        if (navigator.geolocation && leafletMap.current) {
            navigator.geolocation.getCurrentPosition((pos) => {
                leafletMap.current.flyTo([pos.coords.latitude, pos.coords.longitude], 15);
            });
        }
    };

    return (
        <div className={`relative w-full bg-[#010801] overflow-hidden shadow-2xl group transition-all duration-500 ${isFull ? 'h-full rounded-none' : 'aspect-square rounded-[2.5rem] border border-white/10'}`}>

            {/* Tactical Map Layer */}
            <div
                ref={mapRef}
                className="absolute inset-0 z-0 bg-black"
            />

            <style>{`
                .leaflet-tile-pane {
                    filter: grayscale(80%) brightness(0.9) contrast(1.1) sepia(0.2) hue-rotate(150deg) saturate(1.8);
                }
                .quest-map-marker {
                    z-index: 500 !important;
                }
            `}</style>

            {/* Tactical Grid Overlays */}
            <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.1]"
                style={{
                    backgroundImage: 'radial-gradient(circle, #2DD4BF 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(to right, #2DD4BF 1px, transparent 1px), linear-gradient(to bottom, #2DD4BF 1px, transparent 1px)',
                    backgroundSize: '100px 100px'
                }}
            />

            {/* Recenter Icon Style */}
            <div className="absolute bottom-6 right-6 z-30">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLocate}
                    className="w-12 h-12 bg-electric-teal border border-white/10 rounded-full flex items-center justify-center text-black shadow-xl hover:bg-teal-400 transition-all shadow-[0_0_20px_rgba(45,212,191,0.3)]"
                >
                    <Target size={22} strokeWidth={2.5} />
                </motion.button>
            </div>

            {/* Miniature Quest Card Popup */}
            <AnimatePresence>
                {selectedQuest && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className="absolute bottom-6 left-6 right-20 z-40 max-w-[260px]"
                    >
                        <div className="bg-[#1a251a]/95 backdrop-blur-3xl border border-[#2DD4BF]/20 p-4 rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.8)] flex items-center gap-3 relative overflow-hidden ring-1 ring-white/10">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2DD4BF]" />

                            <div className="flex-1 min-w-0 pl-1">
                                {/* Context Label */}
                                {(() => {
                                    const now = new Date();
                                    const start = new Date(selectedQuest.start_time);
                                    const diffMins = Math.floor((start.getTime() - now.getTime()) / 60000);
                                    let label = "UPCOMING";
                                    let color = "text-gray-400"; // Default

                                    if (selectedQuest.status === 'ACTIVE') {
                                        label = "HAPPENING NOW";
                                        color = "text-red-500 animate-pulse";
                                    } else if (diffMins <= 20 && diffMins > 0) {
                                        label = `STARTING IN ${diffMins} MIN`;
                                        color = "text-amber-400";
                                    } else if (diffMins <= 60 && diffMins > 0) {
                                        label = "STARTING SOON";
                                        color = "text-[#2DD4BF]";
                                    }

                                    return (
                                        <div className={`text-[8px] font-black uppercase tracking-widest mb-0.5 ${color}`}>
                                            {label}
                                        </div>
                                    );
                                })()}
                                <h4 className="text-white text-[12px] font-black uppercase tracking-tight truncate mb-1.5">{selectedQuest.title}</h4>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-[#2DD4BF] uppercase tracking-tighter">
                                        <Trophy size={10} strokeWidth={3} /> {selectedQuest.aura_reward}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-white/30 uppercase tracking-tighter">
                                        <Users size={11} strokeWidth={3} /> {selectedQuest.current_participants}/{selectedQuest.max_participants}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => onQuestClick(selectedQuest)}
                                className="w-10 h-10 bg-[#2DD4BF] rounded-xl flex items-center justify-center text-black active:scale-95 transition-transform"
                            >
                                <ChevronRight size={20} strokeWidth={3} />
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedQuest(null); }}
                                className="absolute top-2 right-2 p-1 text-white/10 hover:text-white transition-colors"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuestMap;
