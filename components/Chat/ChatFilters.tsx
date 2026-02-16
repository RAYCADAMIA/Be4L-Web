import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Zap, Lock, MessageCircle, MapPin, ChevronDown } from 'lucide-react';

interface ChatFiltersProps {
    activeTab: 'WORLD' | 'QUEST' | 'PRIVATE';
    setActiveTab: (tab: 'WORLD' | 'QUEST' | 'PRIVATE') => void;
    activeCat: string;
    setActiveCat: (cat: string) => void;
}

const CHAT_CATEGORIES = ['All', 'Unread', 'Recent'];

export const ChatSidebar: React.FC<ChatFiltersProps> = ({
    activeTab,
    setActiveTab,
    activeCat,
    setActiveCat
}) => {
    return (
        <div className="flex flex-col w-full h-full relative select-none px-2 pb-4">
            {/* Minimal Tab Switcher */}
            <div className="flex flex-col gap-2 mb-6 w-full">
                {/* World Tab */}
                <button
                    onClick={() => setActiveTab('WORLD')}
                    className={`
                        flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 relative group h-14 w-full
                        ${activeTab === 'WORLD' ? 'text-blue-400' : 'text-white/40 hover:bg-white/5 hover:text-white'}
                    `}
                >
                    <Globe size={22} strokeWidth={activeTab === 'WORLD' ? 2.5 : 2} className="relative z-10" />
                    <span className="text-[9px] font-black uppercase tracking-widest relative z-10">World</span>
                    {activeTab === 'WORLD' && <motion.div layoutId="chatTabActive" className="absolute inset-0 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]" />}
                </button>

                {/* Quest Tab */}
                <button
                    onClick={() => setActiveTab('QUEST')}
                    className={`
                        flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 relative group h-14 w-full
                        ${activeTab === 'QUEST' ? 'text-amber-400' : 'text-white/40 hover:bg-white/5 hover:text-white'}
                    `}
                >
                    <Zap size={22} className="relative z-10" />
                    <span className="text-[9px] font-black uppercase tracking-widest relative z-10">Quest</span>
                    {activeTab === 'QUEST' && <motion.div layoutId="chatTabActive" className="absolute inset-0 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]" />}
                </button>

                {/* Private Tab */}
                <button
                    onClick={() => setActiveTab('PRIVATE')}
                    className={`
                        flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 relative group h-14 w-full
                        ${activeTab === 'PRIVATE' ? 'text-electric-teal' : 'text-white/40 hover:bg-white/5 hover:text-white'}
                    `}
                >
                    <Lock size={20} className="relative z-10" />
                    <span className="text-[9px] font-black uppercase tracking-widest relative z-10">Private</span>
                    {activeTab === 'PRIVATE' && <motion.div layoutId="chatTabActive" className="absolute inset-0 bg-electric-teal/10 rounded-xl border border-electric-teal/20 shadow-[0_0_15px_rgba(45,212,191,0.15)]" />}
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 w-full">
                <div className="h-px w-full bg-white/5 mb-3 mx-auto" />
                <h3 className="text-[8px] font-bold text-white/20 uppercase tracking-widest text-center mb-2">Filters</h3>
                {CHAT_CATEGORIES.map((cat) => {
                    const isActive = activeCat === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => setActiveCat(cat)}
                            className={`
                                w-full py-2.5 rounded-lg text-center transition-all duration-200 text-[8px] font-black uppercase tracking-wider
                                ${isActive ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-white/30 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const HEADER_FILTERS = ['All', 'Unread', 'Groups'];

export const ChatHeader: React.FC<{
    activeHeading: string;
    setActiveHeading: (h: string) => void;
}> = ({ activeHeading, setActiveHeading }) => {
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
            <div className="px-4">
                <div className="relative overflow-hidden group/chatheader">
                    <div
                        ref={scrollRef}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={stopDragging}
                        onMouseLeave={stopDragging}
                        className={`flex gap-2 items-center overflow-x-auto no-scrollbar pb-1 snap-x ${isDragging ? 'select-none' : ''} cursor-pointer`}
                    >
                        {HEADER_FILTERS.map(filter => {
                            const isActive = activeHeading === filter;
                            return (
                                <button
                                    key={filter}
                                    onClick={() => !isDragging && setActiveHeading(filter)}
                                    className={`
                                        relative h-7 px-4 rounded-full whitespace-nowrap text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 shrink-0 snap-center
                                        ${isActive ? 'bg-electric-teal text-black' : 'bg-white/[0.08] backdrop-blur-md text-gray-400 border border-white/10 hover:bg-white/10'}
                                    `}
                                >
                                    {filter}
                                    {isActive && (
                                        <motion.div
                                            layoutId="chatFilterActive"
                                            className="absolute inset-0 bg-white/20 rounded-full blur-md -z-10"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
