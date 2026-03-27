import React from 'react';
import { Users, Zap, MapPin } from 'lucide-react';
import { Operator } from '../../types';
import { motion } from 'framer-motion';
import { CardSlideshow } from './CardSlideshow';

import { LocationModal } from '../ui/LocationModal';

interface Props {
    operator: Operator;
    onClick: (slug: string) => void;
}

const OperatorCard: React.FC<Props> = ({ operator, onClick }) => {
    const [isMapOpen, setIsMapOpen] = React.useState(false);
    // If we have gallery_images, use them. Otherwise fallback to cover_photo_url.
    const images = operator.gallery_images && operator.gallery_images.length > 0
        ? operator.gallery_images.filter(Boolean)
        : [operator.cover_photo_url || ''];

    return (
        <>
            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onClick(operator.slug)}
                className="group relative w-full aspect-[4/5] bg-deep-black rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-white/5 cursor-pointer hover:border-electric-teal/50 transition-[border-color,box-shadow] duration-500 shadow-xl will-change-transform flex flex-col"
            >
                {/* Slideshow Background */}
                <div className="absolute inset-0 z-0">
                    <CardSlideshow images={images} interval={2500} />
                </div>

                {/* Top Overlay: Vibe Tags & Category */}
                <div className="absolute top-2 right-2 left-2 md:top-4 md:right-4 md:left-4 z-20 flex justify-between items-start pointer-events-none">
                    <div className="flex flex-wrap gap-1 max-w-[60%]">
                        {operator.vibe_tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[8px] md:text-[9px] font-bold text-electric-teal uppercase tracking-widest shadow-sm">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <span className="px-2 py-0.5 md:px-3 md:py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[7px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-sm shrink-0">
                        {operator.category}
                    </span>
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 z-20 bg-gradient-to-t from-black via-black/80 to-transparent pt-12">
                    <div className="flex items-end gap-2 md:gap-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        {/* Avatar (Overlapping) */}
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-electric-teal/50 overflow-hidden bg-black shrink-0 shadow-[0_0_15px_rgba(45,212,191,0.3)]">
                            <img
                                src={operator.logo_url || `https://ui-avatars.com/api/?name=${operator.business_name}&background=111&color=fff`}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex-1 pb-0.5 md:pb-1">
                            <h3 className="text-sm md:text-xl font-black text-white uppercase tracking-tighter leading-none mb-0.5 md:mb-1 shadow-black drop-shadow-md truncate flex items-center gap-1">
                                {operator.business_name}
                                {operator.is_verified && (
                                    <Zap size={10} className="fill-electric-teal text-electric-teal drop-shadow-[0_0_5px_rgba(45,212,191,0.8)]" />
                                )}
                            </h3>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMapOpen(true);
                                }}
                                className="text-[9px] md:text-[11px] text-gray-300 font-bold tracking-widest uppercase flex items-center gap-1 hover:text-electric-teal transition-colors"
                            >
                                <MapPin size={10} className="text-electric-teal" /> {operator.location_text || 'City Unknown'}
                            </button>
                        </div>
                    </div>

                    {/* Animated Tagline & Actions (Fade/Slide up on Hover) */}
                    <div className="mt-3 overflow-hidden h-0 group-hover:h-auto group-hover:mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 border-t border-white/10 pt-3">
                        {operator.tagline && (
                            <p className="text-xs text-gray-300 italic mb-3 line-clamp-2">
                                "{operator.tagline}"
                            </p>
                        )}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-[10px] md:text-xs text-gray-400 font-bold">
                                <Users size={12} /> {operator.followers_count?.toLocaleString() || 0} Followers
                            </div>
                            <span className="text-[10px] text-electric-teal font-black uppercase tracking-widest hover:text-white transition-colors">Enter Brand ➜</span>
                        </div>
                    </div>
                </div>
            </motion.div >

            <LocationModal
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)}
                locationName={operator.location_text}
                googleMapsLink={operator.google_maps_link || ''}
            />
        </>
    );
};

export default OperatorCard;
