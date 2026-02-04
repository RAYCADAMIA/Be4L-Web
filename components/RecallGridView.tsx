import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ChevronLeft, History as HistoryIcon, Play } from 'lucide-react';
import { Capture } from '../types';

export const RecallGridView: React.FC<{
    captures: Capture[],
    onOpenDetail: (c: Capture) => void,
    onClose: () => void
}> = ({ captures, onOpenDetail, onClose }) => {
    const [pullDist, setPullDist] = useState(0);
    const touchY = useRef(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = (e: React.PointerEvent) => {
        touchY.current = e.clientY;
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (touchY.current === 0) return;
        const deltaY = e.clientY - touchY.current;

        const isAtTop = scrollRef.current ? scrollRef.current.scrollTop <= 0 : true;
        const isAtBottom = scrollRef.current
            ? Math.ceil(scrollRef.current.scrollTop + scrollRef.current.clientHeight) >= scrollRef.current.scrollHeight - 10
            : true;

        if (isAtTop && deltaY > 0) {
            setPullDist(deltaY);
        } else if (isAtBottom && deltaY < 0) {
            setPullDist(deltaY);
        } else {
            setPullDist(0);
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if ((pullDist > 220 && (scrollRef.current?.scrollTop || 0) <= 0) ||
            (pullDist < -220 && Math.ceil((scrollRef.current?.scrollTop || 0) + (scrollRef.current?.clientHeight || 0)) >= (scrollRef.current?.scrollHeight || 0) - 10)) {
            onClose();
            if (window.navigator.vibrate) window.navigator.vibrate(15);
        }
        touchY.current = 0;
        setPullDist(0);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!scrollRef.current) return;
        const isAtTop = scrollRef.current.scrollTop <= 0;
        const isAtBottom = Math.ceil(scrollRef.current.scrollTop + scrollRef.current.clientHeight) >= scrollRef.current.scrollHeight - 10;

        if ((isAtTop && e.deltaY < -80) || (isAtBottom && e.deltaY > 80)) {
            onClose();
            if (window.navigator.vibrate) window.navigator.vibrate(10);
        }
    };

    return (
        <motion.div
            key="recall-view"
            initial={{ opacity: 0, y: -window.innerHeight }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -window.innerHeight }}
            transition={{ type: 'spring', damping: 28, stiffness: 220, mass: 1 }}
            ref={scrollRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
            className="absolute inset-0 z-[55] bg-deep-black flex flex-col pt-6 no-scrollbar overflow-y-auto select-none"
        >
            <AnimatePresence>
                {Math.abs(pullDist) > 30 && (
                    <motion.div
                        key="pull-indicator-recall"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: pullDist > 0 ? Math.min(pullDist * 0.25, 40) : Math.max(pullDist * 0.25, -40)
                        }}
                        exit={{ opacity: 0, scale: 0.8, y: pullDist > 0 ? -20 : 20 }}
                        className={`absolute left-0 right-0 z-[60] flex justify-center pointer-events-none ${pullDist > 0 ? 'top-14' : 'bottom-24'}`}
                    >
                        <div className="bg-black/90 backdrop-blur-2xl px-6 py-3 rounded-full border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex items-center gap-3">
                            {pullDist > 0 ? (
                                <ChevronDown size={14} className={pullDist > 220 ? 'text-primary' : 'text-white/40'} />
                            ) : (
                                <ChevronUp size={14} className={pullDist < -220 ? 'text-primary' : 'text-white/40'} />
                            )}
                            <span className={`text-[10px] font-black uppercase tracking-[0.4em] transition-colors ${Math.abs(pullDist) > 220 ? 'text-primary' : 'text-white/40'}`}>
                                {Math.abs(pullDist) > 220 ? 'Release for Feed' : pullDist > 0 ? 'Pull for Feed' : 'Push for Feed'}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recall Header */}
            <div className="px-5 mb-6 flex items-center justify-between">
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 active:text-white transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="flex flex-col items-center">
                    <h2 className="text-lg font-black italic text-white/90 uppercase tracking-[0.2em]">Recall</h2>
                    <div className="flex items-center gap-1.5 opacity-60">
                        <span className="text-[8px] font-black text-primary uppercase tracking-widest">{captures.length} Lore</span>
                        <div className="w-0.5 h-0.5 rounded-full bg-white/40" />
                        <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">Today</span>
                    </div>
                </div>

                <div className="w-10" />
            </div>

            {/* Recall Grid */}
            <div className="px-1 flex-1">
                {captures.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 px-2 pb-10">
                        {captures.sort((a, b) => new Date(a.captured_at || a.created_at).getTime() - new Date(b.captured_at || b.created_at).getTime()).map((c, i) => (
                            <motion.button
                                key={c.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.03, type: 'spring', stiffness: 300, damping: 25 }}
                                onClick={() => onOpenDetail(c)}
                                className="aspect-[3/4] bg-white/5 relative overflow-hidden group active:scale-95 transition-transform rounded-xl border border-white/5"
                            >
                                {c.media_type === 'video' ? (
                                    <video
                                        src={c.back_media_url || c.back_image_url}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <img
                                        src={c.back_media_url || c.back_image_url}
                                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                                        alt="Recall Moment"
                                    />
                                )}

                                {/* Dual Cam PIP Overlay */}
                                <div className="absolute top-2 left-2 w-[30%] aspect-[3/4] rounded-lg border border-white/20 bg-black/40 backdrop-blur-sm overflow-hidden shadow-xl z-20 group-hover:scale-105 transition-transform duration-500">
                                    {c.front_media_url?.includes('.mp4') || c.front_media_url?.startsWith('blob:') ? (
                                        <video src={c.front_media_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={c.front_media_url || c.front_image_url} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                                    {c.media_type === 'video' && <Play size={10} className="text-white/60 fill-current" />}
                                    <span className="text-[9px] font-black text-white italic tracking-tight uppercase">
                                        {new Date(c.captured_at || c.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 text-center px-12">
                        <div className="w-20 h-20 bg-white/[0.03] border border-white/[0.05] rounded-3xl flex items-center justify-center mb-6">
                            <HistoryIcon size={28} className="text-white/10" />
                        </div>
                        <h3 className="text-white/40 font-black uppercase text-xs tracking-[0.3em]">No Lore Today</h3>
                    </div>
                )}
            </div>

            {/* Dismiss Hint Removed as per request */}
            <div className="py-8" />
        </motion.div>
    );
};
