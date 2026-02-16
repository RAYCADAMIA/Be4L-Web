import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, MapPin, ListFilter, ChevronDown } from 'lucide-react';

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
                        ${isExpanded ? 'bg-primary shadow-[0_4px_20px_rgba(45,212,191,0.3)] border-primary text-black' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}
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
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                            ₱{priceRange[1].toLocaleString()}
                                        </span>
                                        {priceRange[1] === MAX_VAL && <span className="text-[7px] font-black text-white/20 uppercase">+</span>}
                                    </div>
                                </div>
                                <div className="relative h-6 flex items-center group">
                                    <input
                                        type="range"
                                        min="0"
                                        max={MAX_VAL}
                                        step="100"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange?.([priceRange[0], Number(e.target.value)])}
                                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary range-sm"
                                    />
                                    <div className="absolute -top-1 left-0 text-[7px] font-bold text-white/10 uppercase tracking-tighter">Budget Friendly</div>
                                    <div className="absolute -top-1 right-0 text-[7px] font-bold text-white/10 uppercase tracking-tighter">Premium</div>
                                </div>
                            </div>

                            {/* Location Filter (Quick Presets Only) */}
                            <div className="space-y-3 px-1">
                                <label className="text-[9px] font-black uppercase text-white/20 tracking-widest flex items-center gap-1.5">
                                    <MapPin size={10} /> City Selection
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {['All Cities', 'Manila', 'Davao', 'Cebu', 'Makati'].map(city => {
                                        const isAll = city === 'All Cities';
                                        const value = isAll ? '' : city;
                                        const isActive = (locationFilter === value);
                                        return (
                                            <button
                                                key={city}
                                                onClick={() => setLocationFilter?.(value)}
                                                className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-primary text-black' : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/5'}`}
                                            >
                                                {city}
                                            </button>
                                        );
                                    })}
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
    priceRange = [0, 10000],
    setPriceRange,
    locationFilter = '',
    setLocationFilter,
}) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const MAX_VAL = 10000;

    // Rail Logic for Web
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const startX = useRef(0);
    const scrollLeftPos = useRef(0);

    const updateArrows = useCallback(() => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeft(scrollLeft > 10);
        setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.addEventListener('scroll', updateArrows);
            updateArrows();
            window.addEventListener('resize', updateArrows);
        }
        return () => {
            el?.removeEventListener('scroll', updateArrows);
            window.removeEventListener('resize', updateArrows);
        };
    }, [updateArrows]);

    const onMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        startX.current = e.pageX - scrollRef.current.offsetLeft;
        scrollLeftPos.current = scrollRef.current.scrollLeft;
        scrollRef.current.style.cursor = 'grabbing';
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX.current) * 2;
        scrollRef.current.scrollLeft = scrollLeftPos.current - walk;
    };

    const stopDragging = () => {
        setIsDragging(false);
        if (scrollRef.current) scrollRef.current.style.cursor = 'pointer';
    };

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const amount = 200;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -amount : amount,
            behavior: 'smooth'
        });
    };

    return (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Categories & Filter Toggle */}
            <div className="flex gap-2 items-center relative z-[100] w-full">
                {/* Single Consolidated Filter Toggle - Replicating Quest Behavior */}
                <div className="relative shrink-0">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`
                                h-8 w-8 flex items-center justify-center rounded-full shrink-0 border transition-all duration-300
                                ${isFilterOpen || locationFilter !== '' || (priceRange[1] < MAX_VAL) ? 'bg-white/10 border-white/20 text-white shadow-[0_8px_32px_rgba(255,255,255,0.1)] backdrop-blur-2xl' : 'bg-white/[0.08] backdrop-blur-3xl border-white/10 text-gray-400 hover:bg-white/10'}
                            `}
                    >
                        <ListFilter size={14} strokeWidth={2.5} />
                    </button>

                    {/* Premium Frozen Glass Filter Window - Same as Quest */}
                    <AnimatePresence>
                        {isFilterOpen && (
                            <>
                                {/* Invisible Backdrop for click-outside behavior */}
                                <div
                                    className="fixed inset-0 z-[150] cursor-default"
                                    onClick={() => setIsFilterOpen(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 mt-2 p-1.5 min-w-[260px] bg-white/[0.05] backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[200] space-y-6"
                                >
                                    {/* Location Section */}
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase text-white/20 tracking-widest flex items-center gap-1.5 px-1">
                                            Select City
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {['All Cities', 'Manila', 'Davao', 'Cebu', 'Makati'].map(city => {
                                                const isAll = city === 'All Cities';
                                                const value = isAll ? '' : city;
                                                const isActive = (locationFilter === value);
                                                return (
                                                    <button
                                                        key={city}
                                                        onClick={() => setLocationFilter?.(value)}
                                                        className={`px-3 py-1.5 rounded-[0.75rem] text-[8px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-white/10 text-white border border-white/20 shadow-[0_4px_12px_rgba(255,255,255,0.05)]' : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/5'}`}
                                                    >
                                                        {city}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Price Range Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[9px] font-black uppercase text-white/20 tracking-widest">
                                                Max Price
                                            </label>
                                            <span className="text-[12px] font-black text-white tracking-widest">
                                                ₱{priceRange[1].toLocaleString()}
                                                {priceRange[1] === MAX_VAL && '+'}
                                            </span>
                                        </div>
                                        <div className="relative h-4 flex items-center">
                                            <input
                                                type="range"
                                                min="0"
                                                max={MAX_VAL}
                                                step="100"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange?.([priceRange[0], Number(e.target.value)])}
                                                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsFilterOpen(false)}
                                        className="w-full py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                                    >
                                        Close Filters
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <div className="h-4 w-px bg-white/10 shrink-0 mx-1" />

                {/* Categories - Enhanced with Web Swiping */}
                <div className="relative flex-1 overflow-hidden group/catlink">
                    <div
                        ref={scrollRef}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={stopDragging}
                        onMouseLeave={stopDragging}
                        className={`flex-1 overflow-x-auto no-scrollbar flex items-center gap-2 pb-1 ${isDragging ? 'select-none' : ''} cursor-pointer`}
                    >
                        {DIB_CATEGORIES.map(cat => {
                            const isActive = activeCat === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => !isDragging && setActiveCat(cat.id)}
                                    className={`
                                        h-8 px-4 rounded-full shrink-0 text-[10px] font-black uppercase tracking-widest transition-all relative border
                                        ${isActive ? 'bg-white border-white text-black' : 'bg-white/[0.08] backdrop-blur-3xl border-white/5 text-gray-400 hover:bg-white/10'}
                                    `}
                                >
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
