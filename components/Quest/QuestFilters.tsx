import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Compass, Zap, SlidersHorizontal, Settings2, MapPin } from 'lucide-react';
import { UNIVERSAL_CATEGORIES } from '../../constants';

interface QuestFiltersProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    onOpenCalendar?: () => void;
    activeCat: string;
    setActiveCat: (cat: string) => void;
    activeTab: 'CANON' | 'SPONTY';
    setActiveTab: (tab: 'CANON' | 'SPONTY') => void;
    loading?: boolean;
    viewingLocation: string;
    setViewingLocation: (loc: string) => void;
}

/**
 * Desktop Vertical Sidebar Filters
 * - Vertical Timeline Rail
 * - Vertical Category List
 */
export const MinimalCalendar: React.FC<{
    selectedDate: Date;
    onSelect: (d: Date) => void;
    onClose: () => void;
}> = ({ selectedDate, onSelect, onClose }) => {
    const [currentMonth, setCurrentMonth] = React.useState(new Date(selectedDate));

    // Get days in month
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    // Get starting day of week (0 = Sunday)
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

    const handlePrev = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const handleNext = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full bg-[#111] border border-white/10 rounded-3xl p-4 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white">
                    <X size={14} />
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrev} className="p-1 hover:bg-white/10 rounded-full text-white/40 hover:text-white"><ChevronLeft size={12} /></button>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                        {currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                    <button onClick={handleNext} className="p-1 hover:bg-white/10 rounded-full text-white/40 hover:text-white"><ChevronRight size={12} /></button>
                </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <span key={d} className="text-[9px] text-white/20 font-black">{d}</span>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const isSelected = d.toDateString() === selectedDate.toDateString();
                    const isToday = d.toDateString() === new Date().toDateString();

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isPast = d < today;

                    return (
                        <button
                            key={day}
                            disabled={isPast}
                            onClick={() => { onSelect(d); }}
                            className={`
                                w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all mx-auto
                                ${isSelected ? 'bg-primary text-black shadow-[0_0_10px_rgba(204,255,0,0.4)]' :
                                    isToday ? 'border border-primary text-primary' :
                                        isPast ? 'text-white/5 cursor-not-allowed' : 'text-zinc-500 hover:bg-white/10 hover:text-white'}
                            `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
};

export const QuestSidebar: React.FC<QuestFiltersProps> = ({
    selectedDate,
    onDateChange,
    onOpenCalendar,
    activeCat,
    setActiveCat,
    activeTab,
    setActiveTab,
    viewingLocation,
    setViewingLocation
}) => {

    // Generate next 3 days
    const dates = React.useMemo(() => {
        return Array.from({ length: 3 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            return d;
        });
    }, []);

    return (
        <div className="flex flex-col w-full h-full relative select-none px-2 pb-4">
            {/* City Filter Toggle & List */}
            <div className="mb-4 pt-2 w-full">
                <button
                    onClick={() => setViewingLocation(viewingLocation === 'Global' ? 'Manila' : 'Global')} // Simple toggle or open menu
                    className="w-full h-10 mb-2 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all group relative"
                >
                    <MapPin size={18} />
                    {viewingLocation !== 'Global' && (
                        <div className="absolute top-2 right-3 w-1.5 h-1.5 bg-primary rounded-full" />
                    )}
                </button>

                {/* Expandable City List (Only showed if we want, but for now lets just show the list of cities cleanly) */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] font-black text-white/20 uppercase tracking-widest text-center mb-1">City</label>
                    {['Global', 'Manila', 'Davao', 'Cebu'].map((city) => {
                        const isActive = viewingLocation === city;
                        return (
                            <button
                                key={city}
                                onClick={() => setViewingLocation(city)}
                                className={`
                                    w-full py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all
                                    ${isActive ? 'bg-primary text-black' : 'text-white/30 hover:text-white hover:bg-white/5'}
                                `}
                            >
                                {city === 'Global' ? 'All' : city}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Minimal Tab Switcher */}
            <div className="flex flex-col gap-2 mb-6 w-full">
                {/* Canon */}
                <button
                    onClick={() => setActiveTab('CANON')}
                    className={`
                        flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 relative group h-14 w-full
                        ${activeTab === 'CANON' ? 'text-primary' : 'text-white/40 hover:bg-white/5 hover:text-white'}
                    `}
                >
                    <Compass size={22} strokeWidth={activeTab === 'CANON' ? 2.5 : 2} className="relative z-10" />
                    <span className="text-[9px] font-black uppercase tracking-widest relative z-10">Canon</span>
                    {activeTab === 'CANON' && <motion.div layoutId="questTabActive" className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(45,212,191,0.15)]" />}
                </button>

                {/* Sponty */}
                <button
                    onClick={() => setActiveTab('SPONTY')}
                    className={`
                        flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 relative group h-14 w-full
                        ${activeTab === 'SPONTY' ? 'text-electric-teal' : 'text-white/40 hover:bg-white/5 hover:text-white'}
                    `}
                >
                    <Zap size={22} className="relative z-10" />
                    <span className="text-[9px] font-black uppercase tracking-widest relative z-10">Sponty</span>
                    {activeTab === 'SPONTY' && <motion.div layoutId="questTabActive" className="absolute inset-0 bg-electric-teal/10 rounded-xl border border-electric-teal/20 shadow-[0_0_15px_rgba(45,212,191,0.15)]" />}
                </button>
            </div>

            {/* Scrollable Filter Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 px-1">

                {/* 2. Timeline (Canon Only) */}
                <AnimatePresence>
                    {activeTab === 'CANON' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                        >
                            <h3 className="text-[8px] font-bold text-white/20 uppercase tracking-widest text-center">Timeline</h3>

                            <div className="relative pl-4 space-y-4 border-l border-white/5 ml-4">
                                {/* Current Date Highlight */}
                                <div className="absolute left-[-3px] top-0 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(45,212,191,0.6)]" />

                                {dates.map((d, i) => {
                                    const isSelected = d.toDateString() === selectedDate.toDateString();
                                    const isToday = i === 0;

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => onDateChange(d)}
                                            className={`
                                                group relative flex flex-col items-start transition-all duration-300 w-full text-left pl-2
                                                ${isSelected ? 'opacity-100 translate-x-1' : 'opacity-40 hover:opacity-80 hover:translate-x-1'}
                                            `}
                                        >
                                            {/* Dot Connector */}
                                            {isSelected && (
                                                <motion.div
                                                    layoutId="timelineDot"
                                                    className="absolute left-[-21px] w-2.5 h-2.5 rounded-full border-2 border-primary bg-deep-black z-10"
                                                />
                                            )}
                                            {!isSelected && <div className="absolute left-[-19px] w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white/50 transition-colors" />}

                                            <span className={`text-[8px] font-black uppercase tracking-widest mb-0.5 ${isSelected ? 'text-primary' : ''}`}>
                                                {isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' })}
                                            </span>
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={onOpenCalendar}
                                    className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-all pt-2 group pl-2"
                                >
                                    <div className="absolute left-[-19px] w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-primary transition-colors" />
                                    <CalendarIcon size={14} className="text-white/40 group-hover:text-primary transition-colors" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 3. Categories */}
                <div className="space-y-2">
                    <h3 className="text-[8px] font-bold text-white/20 uppercase tracking-widest text-center pt-2 border-t border-white/5">Categories</h3>
                    <div className="flex flex-col gap-1">
                        {UNIVERSAL_CATEGORIES.map((cat) => {
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
            </div>
        </div>
    );
};

/**
 * Mobile Horizontal Header Filters
 * - Horizontal Date Scrubber (MissionTimeline logic)
 * - Horizontal Category Pills
 */
export const QuestHeader: React.FC<QuestFiltersProps> = ({
    selectedDate,
    onDateChange,
    activeCat,
    setActiveCat,
    activeTab,
    setActiveTab,
    viewingLocation,
    setViewingLocation,
    onOpenCalendar
}) => {
    const [showFilter, setShowFilter] = React.useState(false);

    // Re-implement simplified MissionTimeline for Mobile Header
    return (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-700 relative z-40">


            {/* Tab Switcher */}
            <div className="px-4 pt-1">
                <div className="flex p-0.5 bg-white/[0.04] rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl">
                    <button
                        onClick={() => setActiveTab('CANON')}
                        className={`
                            flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-all duration-500 relative
                            ${activeTab === 'CANON' ? 'text-primary' : 'text-gray-500 hover:text-white'}
                        `}
                    >
                        <Compass size={13} strokeWidth={activeTab === 'CANON' ? 2.5 : 2} className="relative z-10" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] relative z-10">Canon</span>
                        {activeTab === 'CANON' && (
                            <motion.div
                                layoutId="questTabActiveMobile"
                                className="absolute inset-0 bg-white/[0.05] rounded-full border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
                            />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('SPONTY')}
                        className={`
                            flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-all duration-500 relative
                            ${activeTab === 'SPONTY' ? 'text-electric-teal' : 'text-gray-500 hover:text-white'}
                        `}
                    >
                        <Zap size={13} strokeWidth={activeTab === 'SPONTY' ? 2.5 : 2} className="relative z-10" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] relative z-10">Sponty</span>
                        {activeTab === 'SPONTY' && (
                            <motion.div
                                layoutId="questTabActiveMobile"
                                className="absolute inset-0 bg-white/[0.05] rounded-full border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
                            />
                        )}
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className="px-4">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {UNIVERSAL_CATEGORIES.map(cat => {
                        const isActive = activeCat === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveCat(cat)}
                                className={`
                                    relative h-7 px-4 rounded-full whitespace-nowrap text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300 shrink-0
                                    ${isActive ? 'bg-primary text-black shadow-[0_0_15px_rgba(204,255,0,0.2)]' : 'bg-white/[0.03] backdrop-blur-xl text-gray-400 border border-white/5 hover:bg-white/10'}
                                `}
                            >
                                {cat}
                                {isActive && (
                                    <motion.div
                                        layoutId="questCatActiveMobile"
                                        className="absolute inset-0 bg-primary/20 rounded-full blur-md -z-10"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Simple Date Strip for Mobile (Canon Only) */}
            <AnimatePresence>
                {
                    activeTab === 'CANON' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="px-4 border-b border-white/5 pb-4 overflow-hidden"
                        >
                            <div className="flex items-center gap-2 relative z-50">
                                {/* Filter Icon with Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowFilter(!showFilter)}
                                        className={`p-3 rounded-2xl border transition-all active:scale-95 ${showFilter || viewingLocation !== 'Global' ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(204,255,0,0.4)]' : 'bg-white/[0.03] border-white/5 text-gray-400 hover:text-primary'}`}
                                    >
                                        <SlidersHorizontal size={14} />
                                    </button>

                                    {/* Minimalistic Glassy City Picker Window */}
                                    <AnimatePresence>
                                        {showFilter && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute top-full left-0 mt-2 p-1.5 min-w-[140px] bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col gap-1"
                                            >
                                                <div className="px-2 py-1 mb-1 border-b border-white/5">
                                                    <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Filter Location</span>
                                                </div>
                                                {['Global', 'Davao City', 'Manila', 'Cebu'].map((loc) => {
                                                    const isSelected = viewingLocation === loc;
                                                    return (
                                                        <button
                                                            key={loc}
                                                            onClick={() => {
                                                                setViewingLocation(loc);
                                                                setShowFilter(false);
                                                            }}
                                                            className={`
                                                                w-full text-left px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all
                                                                ${isSelected ? 'bg-primary text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                                                            `}
                                                        >
                                                            {loc === 'Global' ? 'All Cities' : loc}
                                                        </button>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Date Scrubber Pill */}
                                <div className="flex-1 flex justify-between items-center bg-white/[0.02] rounded-2xl p-1 border border-white/5 backdrop-blur-xl">
                                    <button
                                        onClick={() => {
                                            const d = new Date(selectedDate);
                                            d.setDate(d.getDate() - 1);
                                            if (d >= new Date(new Date().setHours(0, 0, 0, 0))) onDateChange(d);
                                        }}
                                        className="p-2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>

                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-primary drop-shadow-[0_0_8px_rgba(204,255,0,0.3)]">
                                            {selectedDate.toDateString() === new Date().toDateString() ? 'TODAY' : selectedDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                                        </span>
                                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-tight">
                                            {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => {
                                            const d = new Date(selectedDate);
                                            d.setDate(d.getDate() + 1);
                                            onDateChange(d);
                                        }}
                                        className="p-2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>

                                {/* Calendar Icon */}
                                <button
                                    onClick={onOpenCalendar}
                                    className="p-3 bg-white/[0.03] rounded-2xl border border-white/5 text-gray-400 hover:text-primary transition-all active:scale-90"
                                >
                                    <CalendarIcon size={14} />
                                </button>
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </div >
    );
}
