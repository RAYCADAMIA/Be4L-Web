import React from 'react';
import { ArrowRight, Star, MapPin } from 'lucide-react';
import { DibsItem, Operator } from '../types';
import { ALPHA_EVENT_ID } from '../constants';

interface DibsItemCardProps {
    item: DibsItem;
    operator?: Operator;
    onClick: () => void;
}

const DibsItemCard: React.FC<DibsItemCardProps> = ({ item, operator, onClick }) => {
    const lowestPrice = item.tiers && item.tiers.length > 0
        ? Math.min(...item.tiers.map(t => t.price))
        : item.price;

    return (
        <div
            onClick={onClick}
            className="group flex flex-col w-full bg-white/5 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 cursor-pointer hover:border-electric-teal/30 transition-all duration-500 shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] bg-gradient-to-br from-white/[0.05] to-transparent"
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Status Overlay Badge */}
                <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 flex gap-1.5 md:gap-2">
                    {/* Status Badge */}
                    <div className={`px-2 py-0.5 md:px-3 md:py-1 backdrop-blur-xl border rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest ${item.id === ALPHA_EVENT_ID
                        ? 'bg-electric-teal text-black border-electric-teal shadow-[0_0_15px_rgba(45,212,191,0.5)]'
                        : 'bg-black/80 text-gray-400 border-white/10'
                        }`}>
                        {item.id === ALPHA_EVENT_ID ? 'LIVE NOW' : 'PROTOTYPE'}
                    </div>
                </div>

                {/* Selection Overlay - Premium Feel */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>

            {/* Metadata (Airbnb Style) */}
            <div className="p-3 md:p-5 flex flex-col gap-1.5 md:gap-2">
                <div className="flex justify-between items-start">
                    <h3 className="text-sm md:text-lg font-black uppercase tracking-tighter text-white leading-tight group-hover:text-electric-teal transition-colors">
                        {item.title}
                    </h3>
                </div>

                <div className="flex flex-col gap-0.5 mt-0.5">
                    <p className="text-gray-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest truncate">
                        {item.description || 'Verified Service'}
                    </p>
                    <p className="text-gray-500 text-[7px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 line-clamp-1">
                        <MapPin size={8} className="text-electric-teal md:w-[10px]" /> {item.event_location || 'Davao City, PH'}
                    </p>
                </div>
                {operator && (
                    <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-white/5">
                        <div className="w-4 h-4 md:w-6 md:h-6 rounded-full overflow-hidden border border-white/10 bg-zinc-900 shrink-0">
                            <img
                                src={operator.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(operator.business_name)}&background=random`}
                                className="w-full h-full object-cover"
                                alt={operator.business_name}
                            />
                        </div>
                        <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors animate-liquid-text truncate">
                            {operator.business_name}
                        </span>
                    </div>
                )}
            </div>

            {/* Price section - Moved inside padding or kept separate with consistent padding */}
            <div className="px-3 pb-3 md:px-5 md:pb-5">
                <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-white/5">
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-[7px] md:text-[8px] font-black uppercase tracking-widest leading-none mb-0.5">Price Starts</span>
                        <p className="text-white font-black text-xs md:text-sm">
                            ₱{lowestPrice.toLocaleString()}
                        </p>
                    </div>
                    <button
                        className="px-2 md:px-3 py-1 bg-white/5 hover:bg-electric-teal hover:text-black rounded-full text-[7px] md:text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 outline-none"
                    >
                        Dibs
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DibsItemCard;
