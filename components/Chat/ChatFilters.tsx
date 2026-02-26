import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, MapPin } from 'lucide-react';

const HEADER_FILTERS = ['All', 'Quest', 'Community', 'Squad', 'DM'];

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
