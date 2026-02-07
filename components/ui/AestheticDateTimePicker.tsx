import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { MissionTimeline } from './AestheticComponents';

interface AestheticDayPickerProps {
    value: Date;
    onChange: (date: Date) => void;
    onClose: () => void;
}

interface AestheticTimeGridProps {
    value: string; // "HH:MM"
    onChange: (time: string, ampm?: string) => void;
    onClose: () => void;
}

const flipTransition = {
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1]
};

const flipVariants = {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 }
};

export const AestheticDayPicker: React.FC<AestheticDayPickerProps> = ({ value, onChange, onClose }) => {
    const [viewDate, setViewDate] = useState(new Date(value));

    // Generate calendar grid
    const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const totalDays = endOfMonth.getDate();

    const days = Array.from({ length: 42 }, (_, i) => {
        const day = i - startDay + 1;
        if (day <= 0 || day > totalDays) return null;
        return day;
    });

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    return (
        <div style={{ perspective: '1000px' }} className="w-full max-w-sm">
            <motion.div
                variants={flipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={flipTransition}
                className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-all">
                        <ChevronLeft size={16} />
                    </button>
                    <h3 className="text-sm font-black tracking-[0.2em] text-white">
                        {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </h3>
                    <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-all">
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <div key={d} className="text-center text-[10px] font-bold text-gray-600 font-mono">{d}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, idx) => {
                        if (!day) return <div key={idx} />;

                        const currentDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                        const isSelected = currentDate.toDateString() === value.toDateString();
                        const isToday = currentDate.toDateString() === new Date().toDateString();

                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    onChange(currentDate);
                                    setTimeout(onClose, 300); // Auto close after selection similar to native aesthetic
                                }}
                                className={`
                                    w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all relative
                                    ${isSelected ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-110 z-10' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                                    ${isToday && !isSelected ? 'text-primary' : ''}
                                `}
                            >
                                {day}
                                {isToday && <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-current opacity-50" />}
                            </button>
                        );
                    })}
                </div>

                {/* Footer Actions */}
                <div className="mt-6 flex justify-center">
                    <button onClick={onClose} className="rounded-full bg-white/5 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export const AestheticTimeGrid: React.FC<AestheticTimeGridProps> = ({ value, onChange, onClose }) => {
    // 10:00 AM, 11:00 AM ... 
    const timeSlots = [
        "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM",
        "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
        "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"
    ];

    // Parse current value to match closest slot for highlight
    // value format "HH:mm" (24h) or "HH:mm" (12h) ... assuming input matches the creation state "12:00"

    return (
        <div style={{ perspective: '1000px' }} className="w-full max-w-sm">
            <motion.div
                variants={flipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={flipTransition}
                className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
            >
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-sm font-black tracking-[0.2em] text-white">SELECT TIME</h3>
                    <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full text-gray-500 hover:text-white"><X size={16} /></button>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto no-scrollbar">
                    {timeSlots.map(slot => (
                        <button
                            key={slot}
                            onClick={() => {
                                // Convert "1:00 PM" to "13:00" for internal state if needed, or stick to string
                                // Assuming parent handles 24h conversion if needed, but for visual consistency pass as string first
                                // Actually, let's just return the slot and let parent parse
                                onChange(slot);
                                setTimeout(onClose, 200);
                            }}
                            className={`
                                py-4 rounded-2xl border transition-all flex items-center justify-center text-xs font-black tracking-widest
                                ${false
                                    ? 'bg-white text-black border-white shadow-lg'
                                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20'}
                            `}
                        >
                            {slot}
                        </button>
                    ))}
                    {/* Dibbed/Blocked Slots Example (Visual Only as per user request context) */}
                    <button disabled className="py-4 rounded-2xl border border-white/5 bg-black/40 text-gray-700 text-[10px] font-black tracking-widest cursor-not-allowed">
                        DIBBED
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
