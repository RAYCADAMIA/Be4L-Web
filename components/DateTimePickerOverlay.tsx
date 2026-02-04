import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Clock, Calendar } from 'lucide-react';

interface DatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    onClose: () => void;
}

interface TimePickerProps {
    value: string; // HH:MM (24h format internally, but UI can be 12h)
    onChange: (time: string) => void;
    onClose: () => void;
    selectedDate?: string; // YYYY-MM-DD to check if we need to disable past times
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const CustomDatePicker: React.FC<DatePickerProps> = ({ value, onChange, onClose }) => {
    // Parse initial date or default to today
    const initialDate = value ? new Date(value) : new Date();
    const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
    const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
    const [selectedDate, setSelectedDate] = useState(value);

    // Helpers
    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        const today = new Date();
        const todayMonth = today.getMonth();
        const todayYear = today.getFullYear();

        // Don't allow going to past months
        if (currentYear === todayYear && currentMonth === todayMonth) {
            return;
        }

        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const handleSelectDate = (day: number) => {
        // Format: YYYY-MM-DD
        // Ensure leading zeros
        const m = (currentMonth + 1).toString().padStart(2, '0');
        const d = day.toString().padStart(2, '0');
        const dateStr = `${currentYear}-${m}-${d}`;
        setSelectedDate(dateStr);
        onChange(dateStr);
        // Optional: Close on select? Or require explicit "Done"? 
        // User image suggests explicit Done or just click. Let's auto-close for speed or provide Done button.
        // Let's add a "Done" button for confirmation.
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    // Generate grid
    const blanks = Array.from({ length: firstDay }, (_, i) => i);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-surface border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl overflow-hidden relative"
            >
                {/* Background Glow */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-primary/5 blur-3xl rounded-full pointer-events-none" />

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
                        {MONTHS[currentMonth]} <span className="text-primary">{currentYear}</span>
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"><ChevronLeft size={20} /></button>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"><ChevronRight size={20} /></button>
                    </div>
                </div>

                <div className="grid grid-cols-7 mb-4">
                    {DAYS.map(d => (
                        <div key={d} className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest py-2">
                            {d}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {blanks.map(b => <div key={`blank-${b}`} />)}
                    {days.map(d => {
                        const m = (currentMonth + 1).toString().padStart(2, '0');
                        const dayStr = d.toString().padStart(2, '0');
                        const fullDate = `${currentYear}-${m}-${dayStr}`;
                        const isSelected = selectedDate === fullDate;
                        const today = new Date().toISOString().split('T')[0];
                        const isToday = today === fullDate;
                        const isPast = fullDate < today;

                        return (
                            <button
                                key={d}
                                onClick={() => !isPast && handleSelectDate(d)}
                                disabled={isPast}
                                className={`
                                    h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all relative
                                    ${isSelected ? 'bg-primary text-black scale-110 shadow-[0_0_15px_rgba(204,255,0,0.4)]' : isPast ? 'text-gray-700 cursor-not-allowed' : 'text-white hover:bg-white/10'}
                                    ${isToday && !isSelected ? 'border border-primary/30 text-primary' : ''}
                                `}
                            >
                                {d}
                            </button>
                        )
                    })}
                </div>

                <div className="mt-8 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold uppercase text-xs tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                    <button onClick={onClose} className="flex-1 py-3 bg-white text-black rounded-xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-colors shadow-lg">Done</button>
                </div>
            </motion.div>
        </div>
    );
};

export const CustomTimePicker: React.FC<TimePickerProps> = ({ value, onChange, onClose, selectedDate }) => {
    // Value is "HH:MM", e.g., "14:30"
    // Parse into 12h format
    const [hour24, setHour24] = useState(value ? parseInt(value.split(':')[0]) : 12);
    const [minute, setMinute] = useState(value ? parseInt(value.split(':')[1]) : 0);

    // Check if selected date is today
    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();

    // Determine AM/PM
    const isPM = hour24 >= 12;
    const hour12 = hour24 % 12 || 12; // 0 becomes 12

    const toggleAmPm = () => {
        if (isPM) {
            // Was PM, become AM: subtract 12
            setHour24(hour24 - 12);
        } else {
            // Was AM, become PM: add 12
            setHour24(hour24 + 12);
        }
    };

    const handleHourSelect = (h: number) => {
        // h is 1-12
        let newH24 = h;
        if (isPM && h !== 12) newH24 = h + 12;
        if (!isPM && h === 12) newH24 = 0;
        setHour24(newH24);
    };

    const handleMinuteSelect = (m: number) => {
        setMinute(m);
    };

    const handleSave = () => {
        const hStr = hour24.toString().padStart(2, '0');
        const mStr = minute.toString().padStart(2, '0');
        onChange(`${hStr}:${mStr}`);
        onClose();
    };

    const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
            <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#05050A] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-sm shadow-3xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 right-0 h-32 bg-primary/5 blur-3xl pointer-events-none" />

                <div className="text-center mb-8 relative z-10">
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6">Set Mission Time</h2>
                    <div className="flex items-center justify-center gap-2 bg-white/5 rounded-3xl py-6 border border-white/5">
                        <span className="text-5xl font-black text-white tracking-tighter w-16 text-center">{hour12}</span>
                        <span className="text-5xl font-black text-white/20 tracking-tighter animate-pulse">:</span>
                        <span className="text-5xl font-black text-white tracking-tighter w-16 text-center">{minute.toString().padStart(2, '0')}</span>
                        <span className="text-xl font-black text-primary ml-2 italic">{isPM ? 'PM' : 'AM'}</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 h-64 relative z-10">
                    {/* HOURS */}
                    <div className="flex flex-col items-center overflow-y-auto no-scrollbar mask-fade-vertical">
                        <span className="text-[9px] font-black text-gray-600 uppercase mb-4 tracking-widest">Hour</span>
                        {hours.map(h => {
                            let h24 = h;
                            if (isPM && h !== 12) h24 = h + 12;
                            if (!isPM && h === 12) h24 = 0;
                            const isPast = isToday && h24 < currentHour;
                            const isSelected = hour12 === h;

                            return (
                                <button
                                    key={h}
                                    onClick={() => !isPast && handleHourSelect(h)}
                                    className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl text-base font-black transition-all mb-1
                                        ${isSelected ? 'bg-primary text-black' : isPast ? 'text-gray-800 pointer-events-none opacity-20' : 'text-white/40 hover:text-white hover:bg-white/5'}
                                    `}
                                >
                                    {h}
                                </button>
                            );
                        })}
                        <div className="h-20 shrink-0" /> {/* Padding for scroll */}
                    </div>

                    {/* MINUTES */}
                    <div className="flex flex-col items-center overflow-y-auto no-scrollbar mask-fade-vertical border-x border-white/5">
                        <span className="text-[9px] font-black text-gray-600 uppercase mb-4 tracking-widest">Min</span>
                        {minutes.map(m => {
                            const isPast = isToday && hour24 === currentHour && m < currentMinute;
                            const isSelected = minute === m;

                            return (
                                <button
                                    key={m}
                                    onClick={() => !isPast && handleMinuteSelect(m)}
                                    className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl text-base font-black transition-all mb-1
                                        ${isSelected ? 'bg-white/10 text-white border border-white/10' : isPast ? 'text-gray-800 pointer-events-none opacity-20' : 'text-white/40 hover:text-white hover:bg-white/5'}
                                    `}
                                >
                                    {m.toString().padStart(2, '0')}
                                </button>
                            );
                        })}
                        <div className="h-20 shrink-0" />
                    </div>

                    {/* AM/PM */}
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-gray-600 uppercase mb-4 tracking-widest">Zone</span>
                        <div className="flex flex-col gap-2 w-full px-2">
                            <button
                                onClick={() => isPM && toggleAmPm()}
                                className={`h-20 rounded-2xl flex items-center justify-center text-sm font-black transition-all border
                                    ${!isPM ? 'bg-primary text-black border-primary' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10'}
                                `}
                            >
                                AM
                            </button>
                            <button
                                onClick={() => !isPM && toggleAmPm()}
                                className={`h-20 rounded-2xl flex items-center justify-center text-sm font-black transition-all border
                                    ${isPM ? 'bg-primary text-black border-primary' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10'}
                                `}
                            >
                                PM
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Abort</button>
                    <button onClick={handleSave} className="flex-1 py-4 bg-white text-black rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]">Establish</button>
                </div>
            </motion.div>
        </div>
    );
};
