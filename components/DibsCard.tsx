import React from 'react';
import { MapPin, ArrowRight, BadgeCheck } from 'lucide-react';

export interface Operator {
    user_id: string;
    business_name: string;
    slug: string;
    bio?: string;
    category: string;
    cover_photo_url: string;
    logo_url: string;
    location_text: string;
    is_verified?: boolean;
    offerings?: string[]; // e.g. ["Pickleball", "Coaching"]
    rating?: number;
}

interface Props {
    operator: Operator;
    onClick: (slug: string) => void;
    isMe?: boolean;
}

const DibsCard: React.FC<Props> = ({ operator, onClick, isMe }) => {
    if (!operator) return null;
    return (
        <div
            onClick={() => onClick(operator.slug)}
            className="group flex flex-col w-full bg-white/5 rounded-[2.5rem] overflow-hidden border border-white/5 cursor-pointer hover:border-primary/30 transition-all duration-500 shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] bg-gradient-to-br from-white/[0.05] to-transparent h-full relative"
        >
            {/* Cover Image Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden shrink-0">
                <img
                    src={operator.cover_photo_url}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={operator.business_name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5">
                    <div className="px-3 py-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-white">
                        {operator.category}
                    </div>
                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-white/40">
                        PROTOTYPE
                    </div>
                    {isMe && (
                        <div className="px-3 py-1 bg-primary text-black rounded-full text-[9px] font-black uppercase tracking-widest">
                            Your Brand
                        </div>
                    )}
                </div>

                {/* Selection Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none" />
            </div>

            {/* Content Section - Unified Padding with ItemCard */}
            <div className="p-4 md:p-5 flex flex-col flex-1 gap-3 md:gap-4 relative z-10 text-center">
                <div className="flex flex-col items-center -mt-8 md:-mt-10">
                    {/* PFP in Circle frame */}
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-deep-black bg-zinc-900 shadow-2xl mb-2 md:mb-3 relative z-20 transform transition-transform group-hover:scale-110 duration-500">
                        <img
                            src={operator.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(operator.business_name)}&background=random`}
                            className="w-full h-full object-cover"
                            alt="logo"
                        />
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-xs md:text-base font-black uppercase tracking-tighter leading-none group-hover:text-primary transition-colors line-clamp-1">
                            <span className="animate-liquid-text">
                                {operator.business_name}
                            </span>
                            {operator.is_verified && <BadgeCheck size={12} className="inline ml-1 text-primary fill-primary/20 md:w-[14px]" />}
                        </h3>

                        {/* Slogan/Bio */}
                        <p className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest line-clamp-1">
                            {operator.bio || 'Official Partner'}
                        </p>

                        <div className="flex items-center justify-center gap-1.2 md:gap-1.5 text-gray-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest pt-1">
                            <MapPin size={8} className="text-primary md:w-[10px]" />
                            {operator.location_text || 'Davao City, PH'}
                        </div>
                    </div>
                </div>

                {/* Offerings Tags */}
                <div className="flex-1 mt-auto">
                    <div className="flex flex-wrap gap-1 md:gap-1.5 justify-center">
                        {(operator.offerings || ['Pickleball', 'Events', 'Competition']).slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-white/5 border border-white/5 rounded-md text-[7px] md:text-[8px] font-black text-gray-300 uppercase tracking-widest">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* CTA Action */}
                <div className="pt-3 md:pt-4 border-t border-white/5 flex items-center justify-between">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick(operator.slug);
                        }}
                        className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-all outline-none"
                    >
                        Profile
                    </button>
                    <div className="hidden sm:block px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Verified
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DibsCard;
