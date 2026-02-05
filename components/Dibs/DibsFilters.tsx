import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, MapPin, ListFilter, Search, ChevronDown } from 'lucide-react';

export const DIB_CATEGORIES = [
    { id: 'All', label: 'All' },
    { id: 'Courts', label: 'Courts' },
    { id: 'Events', label: 'Events' },
    { id: 'Competitions', label: 'Competitions' },
    { id: 'Services', label: 'Services' },
    { id: 'Resto', label: 'Resto' },
    { id: 'Cafe', label: 'Cafe' },
    { id: 'Vacation', label: 'Vacation' },
    { id: 'Hotels', label: 'Hotels' },
];

interface DibsFiltersProps {
    activeCat: string;
    setActiveCat: (cat: string) => void;
    priceRange?: [number, number];
    setPriceRange?: (range: [number, number]) => void;
    locationFilter?: string;
    setLocationFilter?: (l: string) => void;
}

export const DibsSidebar: React.FC<DibsFiltersProps> = ({
    activeCat,
    setActiveCat,
    priceRange = [0, 5000],
    setPriceRange,
    locationFilter = '',
    setLocationFilter,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Max price for the range slider
    const MAX_VAL = 10000;

    return (
        <div className="flex flex-col w-full h-full relative select-none px-4 pb-4 gap-8">

            {/* Filter Hub */}
            <div className="pt-4 px-1">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`
                        w-full flex items-center justify-between px-4 py-4 rounded-2xl border transition-all duration-300 group
                        ${isExpanded ? 'bg-electric-teal shadow-[0_4px_20px_rgba(45,212,191,0.3)] border-electric-teal text-black' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}
                    `}
                >
                    <div className="flex items-center gap-3">
                        <ListFilter size={16} strokeWidth={3} className={isExpanded ? 'text-black' : 'text-gray-400 group-hover:text-white'} />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Filter</span>
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 opacity-40' : 'opacity-40'}`} />
                </button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden space-y-6 pt-6"
                        >
                            {/* Price Range Slider */}
                            <div className="space-y-4 px-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-[9px] font-black uppercase text-white/20 tracking-widest flex items-center gap-1.5">
                                        <DollarSign size={10} /> Maximum Price
                                    </label>
                                    <span className="text-[10px] font-black text-electric-teal uppercase tracking-widest">
                                        ₱{priceRange[1].toLocaleString()}
                                    </span>
                                </div>
                                <div className="relative h-6 flex items-center group">
                                    <input
                                        type="range"
                                        min="0"
                                        max={MAX_VAL}
                                        step="100"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange?.([priceRange[0], Number(e.target.value)])}
                                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-electric-teal range-sm"
                                    />
                                    <div className="absolute -top-1 left-0 text-[7px] font-bold text-white/10 uppercase tracking-tighter">Budget Friendly</div>
                                    <div className="absolute -top-1 right-0 text-[7px] font-bold text-white/10 uppercase tracking-tighter">Premium</div>
                                </div>
                            </div>

                            {/* Location Search */}
                            <div className="space-y-3 px-1">
                                <label className="text-[9px] font-black uppercase text-white/20 tracking-widest flex items-center gap-1.5">
                                    <MapPin size={10} /> Location
                                </label>
                                <div className="relative group">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-electric-teal transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Enter Area..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-[10px] font-bold text-white placeholder:text-white/10 focus:border-electric-teal/50 outline-none transition-all"
                                        value={locationFilter}
                                        onChange={(e) => setLocationFilter?.(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="h-px w-full bg-white/5 mx-auto mt-2" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main Categories */}
            <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em] px-2">Brand Categories</h2>

                <div className="flex flex-col gap-1.5 px-1">
                    {DIB_CATEGORIES.map((cat) => {
                        const isActive = activeCat === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCat(cat.id)}
                                className={`
                                    w-full text-left py-3.5 px-4 rounded-2xl transition-all duration-300 relative group
                                    ${isActive ? 'text-white' : 'text-white/30 hover:text-white hover:bg-white/[0.04]'}
                                `}
                            >
                                <span className="text-[10px] font-black uppercase tracking-[0.12em] relative z-10 block truncate">
                                    {cat.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="sideActiveCat"
                                        className="absolute inset-0 bg-white/[0.08] rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};

export const DibsHeader: React.FC<DibsFiltersProps> = ({
    activeCat,
    setActiveCat,
    priceRange = [0, 5000],
    setPriceRange,
    locationFilter = '',
    setLocationFilter,
}) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const MAX_VAL = 10000;

    return (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Categories & Filter Toggle */}
            <div className="px-4">
                <div className="flex gap-2 items-center overflow-x-auto no-scrollbar pb-1">
                    {/* Mobile Filter Toggle */}
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`
                            h-7 w-7 flex items-center justify-center rounded-full shrink-0 border transition-all duration-300
                            ${isFilterOpen ? 'bg-electric-teal border-electric-teal text-black shadow-[0_0_15px_rgba(45,212,191,0.4)]' : 'bg-white/[0.08] backdrop-blur-md border-white/10 text-gray-400 hover:bg-white/10'}
                        `}
                    >
                        <ListFilter size={12} strokeWidth={2.5} />
                    </button>

                    <div className="h-3 w-px bg-white/10 shrink-0 mx-1" />

                    {DIB_CATEGORIES.map(cat => {
                        const isActive = activeCat === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCat(cat.id)}
                                className={`
                                    relative h-7 px-4 rounded-full whitespace-nowrap text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 shrink-0
                                    ${isActive ? 'bg-electric-teal text-black' : 'bg-white/[0.08] backdrop-blur-md text-gray-400 border border-white/10 hover:bg-white/10'}
                                `}
                            >
                                {cat.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="dibsCatActiveMobile"
                                        className="absolute inset-0 bg-white/20 rounded-full blur-md -z-10"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Filter Dropdown */}
            <AnimatePresence>
                {isFilterOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFilterOpen(false)}
                            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm md:hidden"
                        />

                        {/* Dropdown Card */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="fixed top-24 left-4 right-4 z-[101] md:hidden"
                        >
                            <div className="bg-[#0A0A0A]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-3xl space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Refine Sector</h3>
                                    <button
                                        onClick={() => setIsFilterOpen(false)}
                                        className="text-[9px] font-black uppercase text-gray-500 hover:text-white transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>

                                {/* Price Range */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[9px] font-black uppercase text-white/20 tracking-widest flex items-center gap-1.5">
                                            <DollarSign size={10} /> Maximum Price
                                        </label>
                                        <span className="text-[10px] font-black text-electric-teal uppercase tracking-widest">
                                            ₱{priceRange[1].toLocaleString()}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={MAX_VAL}
                                        step="100"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange?.([priceRange[0], Number(e.target.value)])}
                                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-electric-teal"
                                    />
                                </div>

                                {/* Location */}
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase text-white/20 tracking-widest flex items-center gap-1.5">
                                        <MapPin size={10} /> Location
                                    </label>
                                    <div className="relative group">
                                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                        <input
                                            type="text"
                                            placeholder="WHERE ARE YOU?"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[10px] font-black text-white placeholder:text-white/10 outline-none focus:border-electric-teal transition-all uppercase italic"
                                            value={locationFilter}
                                            onChange={(e) => setLocationFilter?.(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
