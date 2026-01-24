import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { dailyService } from '../../services/dailyService';

/**
 * Aesthetic App Background (Aurora Mesh)
 */
export const AestheticAppBackground: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
    return (
        <div className={`relative overflow-hidden bg-deep-black text-white ${className}`}>
            {/* Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-deep-black transition-colors duration-500" />
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] animate-lore-slow opacity-60 dark:opacity-40" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] animate-lore-slow delay-1000 opacity-60 dark:opacity-40" />
                <div className="absolute top-[40%] left-[40%] w-[35%] h-[35%] rounded-full bg-blue-500/5 blur-[100px] animate-pulse opacity-50 dark:opacity-30" />

                {/* Noise Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none" />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 w-full h-full text-primary-text">
                {children}
            </div>
        </div>
    );
};

/**
 * Glassmorphism Card
 */
export const GlassCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className = "", children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={`
                bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-3xl 
                shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] 
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    );
});

/**
 * Gradient Action Button
 */
export const GradientButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: React.ReactNode, fullWidth?: boolean }> = ({
    children, className = "", icon, fullWidth = false, ...props
}) => {
    return (
        <button
            className={`
                relative px-6 py-3 rounded-xl font-black uppercase tracking-wider text-xs text-black
                bg-gradient-to-r from-primary to-lime-400
                shadow-[0_0_20px_rgba(204,255,0,0.3)]
                transition-all duration-300
                hover:shadow-[0_0_40px_rgba(204,255,0,0.5)] hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 overflow-hidden group
                ${fullWidth ? 'w-full' : ''}
                ${className}
            `}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2">
                {icon}
                {children}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />
        </button>
    );
};

/**
 * Glowing Text Header
 */
export const GlowText: React.FC<{ children: React.ReactNode; className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ children, className = "", size = 'md' }) => {
    const sizes = {
        sm: "text-sm",
        md: "text-xl",
        lg: "text-3xl",
        xl: "text-5xl"
    };

    return (
        <h1 className={`font-black italic text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] ${sizes[size]} ${className}`}>
            {children}
        </h1>
    );
};

/**
 * Aesthetic Feed Placeholder / Unlock Overlay
 */
export const FeedPlaceholder: React.FC<{
    title: string;
    description: string;
    icon?: React.ReactNode;
    buttonLabel?: string;
    onAction?: () => void
}> = ({ title, description, icon, buttonLabel, onAction }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5 py-20 animate-in fade-in zoom-in duration-700">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-2xl">
                    {icon}
                </div>
            </div>
            <div className="space-y-2">
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
                <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed font-medium uppercase tracking-widest">{description}</p>
            </div>
            {buttonLabel && onAction && (
                <GradientButton onClick={onAction} className="mt-4 px-8 py-4 h-auto">
                    {buttonLabel}
                </GradientButton>
            )}
        </div>
    );
};

/**
 * Aesthetic Lore Loader (HD)
 */
export const EKGLoader: React.FC<{ size?: number; color?: string; isFlatline?: boolean; className?: string; showLabel?: boolean }> = ({ size = 120, color = "#CCFF00", isFlatline = false, className = "", showLabel = true }) => {
    return (
        <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
            <svg width={size} height={size / 2} viewBox="0 0 120 60" className="opacity-80 drop-shadow-[0_0_10px_rgba(204,255,0,0.3)]">
                <motion.path
                    d="M0 30 H20 L25 10 L35 50 L45 30 H70 L75 5 L85 55 L95 30 H120"
                    fill="transparent"
                    stroke={isFlatline ? "#ef4444" : color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0.2 }}
                    animate={{
                        pathLength: [0, 1, 1],
                        pathOffset: isFlatline ? 0 : [0, 0, 1],
                        opacity: [0.2, 1, 0.2]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </svg>
            {showLabel && false && (
                <span className={`text-[9px] font-black uppercase tracking-[0.4em] animate-pulse italic ${isFlatline ? 'text-red-500' : 'text-primary'}`}>
                    {isFlatline ? 'Critical Lore' : 'Syncing Vitals...'}
                </span>
            )}
        </div>
    );
};

/**
 * Heartbeat Effect Transition
 */
export const HeartbeatTransition: React.FC<{ children: React.ReactNode; isVisible?: boolean, loading?: boolean, label?: string }> = ({ children, isVisible = true, loading, label }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <EKGLoader showLabel={false} />
            </div>
        )
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    className="w-full h-full"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

/**
 * Aesthetic Daily Countdown Timer
 */


export const DailyCountdown: React.FC<{ onTimerZero?: () => void, className?: string }> = ({ onTimerZero, className = "" }) => {
    const [timeLeft, setTimeLeft] = React.useState('');
    const [isCritical, setIsCritical] = React.useState(false);

    const lastWindowStartRef = useRef<number>(dailyService.getCurrentWindowStart().getTime());

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const currentWindowStart = dailyService.getCurrentWindowStart().getTime();
            const nextReset = dailyService.getNextResetTime();

            if (currentWindowStart > lastWindowStartRef.current) {
                console.log("🌊 LORE CYCLE REFRESHED: New Temporal Window Active");
                lastWindowStartRef.current = currentWindowStart;
                if (onTimerZero) onTimerZero();
            }

            const diff = nextReset.getTime() - now.getTime();
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setIsCritical(diff > 0 && diff <= 10000);

            return `${Math.max(0, minutes).toString().padStart(2, '0')}:${Math.max(0, seconds).toString().padStart(2, '0')}`;
        };

        setTimeLeft(calculateTimeLeft());
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(interval);
    }, [onTimerZero]);


    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <Timer size={14} className={isCritical ? "text-red-500" : "text-primary"} />
            <span className={`text-[10px] font-black tracking-[0.2em] font-mono uppercase transition-colors duration-300 ${isCritical ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
                {timeLeft}
            </span>
        </div>
    );
};

/**
 * Aesthetic Mission Calendar Modal
 */
export const MissionCalendarModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}> = ({ isOpen, onClose, selectedDate, onSelectDate }) => {
    const [viewDate, setViewDate] = useState(new Date(selectedDate));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const monthEnd = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days = [];
    let day = new Date(startDate);
    while (day <= monthEnd || days.length % 7 !== 0) {
        days.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Temporal Map</h3>
                        <p className="text-white text-xl font-black italic tracking-tighter">
                            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full bg-white/5 text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="p-6">
                    <div className="grid grid-cols-7 mb-4">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                            <div key={d} className="text-center text-[10px] font-black text-gray-600 uppercase">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((d, i) => {
                            const isCurrentMonth = d.getMonth() === viewDate.getMonth();
                            const isPast = d < today;
                            const isSelected = d.toDateString() === selectedDate.toDateString();
                            const isToday = d.toDateString() === today.toDateString();

                            return (
                                <button
                                    key={i}
                                    disabled={isPast || !isCurrentMonth}
                                    onClick={() => {
                                        onSelectDate(d);
                                        onClose();
                                    }}
                                    className={`
                                        aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all relative
                                        ${!isCurrentMonth ? 'opacity-0 pointer-events-none' : ''}
                                        ${isPast ? 'text-gray-800' : 'text-white hover:bg-white/5'}
                                        ${isSelected ? 'bg-primary text-black shadow-[0_0_20px_rgba(204,255,0,0.4)] scale-110' : ''}
                                        ${isToday && !isSelected ? 'border border-primary/30 text-primary' : ''}
                                    `}
                                >
                                    {d.getDate()}
                                    {isToday && !isSelected && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Controls */}
                <div className="p-4 bg-white/5 flex justify-between items-center">
                    <button
                        onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
                        className="p-3 text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => {
                            onSelectDate(today);
                            setViewDate(today);
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
                        className="p-3 text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

/**
 * Mission Timeline Rail Component
 */
export const MissionTimeline: React.FC<{
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    daysCount?: number;
    className?: string;
}> = ({ selectedDate, onDateChange, daysCount = 7, className = "" }) => {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Generate dates
    const dates = React.useMemo(() => {
        return Array.from({ length: daysCount }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            return d;
        });
    }, [daysCount]);

    const activeIndex = dates.findIndex(d => d.toDateString() === selectedDate.toDateString());

    const handleTouch = (e: React.MouseEvent | React.TouchEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const clientX = ('touches' in e) ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
        const x = clientX - rect.left;
        const percent = Math.max(0, Math.min(1, x / rect.width));
        const index = Math.round(percent * (daysCount - 1));

        if (index !== activeIndex && index >= 0 && index < dates.length) {
            onDateChange(dates[index]);
            if (window.navigator.vibrate) window.navigator.vibrate(10);
        }
    };

    return (
        <>
            <div className={`flex flex-col py-2 select-none ${className}`}>
                {/* Timeline Rail */}
                <div className="flex items-center gap-4 px-6 relative h-8">
                    {/* Dynamic Label (Today or Date) */}
                    <div className="w-16 shrink-0 relative flex items-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex === 0 ? 'today' : selectedDate.toDateString()}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="text-[10px] font-black uppercase tracking-[0.1em] whitespace-nowrap text-primary drop-shadow-[0_0_10px_rgba(204,255,0,0.5)]"
                            >
                                {activeIndex === 0 ? 'TODAY' : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Rail Scrub Area */}
                    <div
                        className="relative flex-1 h-full flex items-center cursor-pointer touch-none"
                        onMouseMove={(e) => e.buttons === 1 && handleTouch(e)}
                        onMouseDown={handleTouch}
                        onTouchMove={handleTouch}
                        onTouchStart={handleTouch}
                    >
                        <div className="absolute left-0 right-0 h-[1px] bg-white/10" />
                        <div className="absolute inset-0 flex justify-between items-center pointer-events-none px-[2px]">
                            {dates.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-0.5 h-0.5 rounded-full transition-all duration-500 ${i === activeIndex ? 'bg-primary scale-[2.5] shadow-[0_0_5px_#CCFF00]' : 'bg-white/10'}`}
                                />
                            ))}
                        </div>
                        <motion.div
                            initial={false}
                            animate={{
                                left: activeIndex === -1 ? '100%' : `${(activeIndex / (dates.length - 1)) * 100}%`,
                                opacity: activeIndex === -1 ? 0.3 : 1
                            }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_15px_rgba(204,255,0,0.9)] -translate-x-1/2 z-10"
                        />
                    </div>

                    {/* Calendar Toggle */}
                    <button
                        onClick={() => setIsCalendarOpen(true)}
                        className={`p-2 rounded-xl transition-all ${activeIndex === -1 ? 'bg-primary text-black shadow-[0_0_15px_rgba(204,255,0,0.4)]' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                    >
                        <CalendarIcon size={16} strokeWidth={2.5} />
                    </button>

                    {/* End Decorative Rail */}
                    <div className="h-[1px] w-4 bg-white/5 shrink-0" />
                </div>
            </div>

            <AnimatePresence>
                {isCalendarOpen && (
                    <MissionCalendarModal
                        isOpen={isCalendarOpen}
                        onClose={() => setIsCalendarOpen(false)}
                        selectedDate={selectedDate}
                        onSelectDate={onDateChange}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

/**
 * Aesthetic Floating Tabs Component
 * Unified tab design as per v1.2 spec
 */
export const FloatingTabs: React.FC<{
    tabs: { label: string; value: string }[];
    activeTab: string;
    onChange: (value: string) => void;
    className?: string;
}> = ({ tabs, activeTab, onChange, className = "" }) => {
    return (
        <div className={`flex items-center justify-center gap-6 py-4 px-8 bg-black/40 backdrop-blur-2xl rounded-full border border-white/[0.02] shadow-2xl pointer-events-auto ${className}`}>
            {tabs.map((tab, index) => (
                <React.Fragment key={tab.value}>
                    <button
                        onClick={() => onChange(tab.value)}
                        className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 ${activeTab === tab.value ? 'text-primary drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]' : 'text-white/20 hover:text-white/40'}`}
                    >
                        {tab.label}
                    </button>
                    {index < tabs.length - 1 && <div className="w-[1px] h-3 bg-white/[0.05] mx-1" />}
                </React.Fragment>
            ))}
        </div>
    );
};
