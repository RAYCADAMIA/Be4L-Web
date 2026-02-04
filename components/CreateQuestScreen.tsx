import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Calendar, Users, MapPin, Zap, ArrowRight, ChevronLeft, CalendarDays,
    Search, ChevronRight, MessageSquare, Compass, Plus, Minus, ShieldCheck, Trophy, Globe, Lock
} from 'lucide-react';
import { useMotionValue, useTransform } from 'framer-motion';
import { supabaseService } from '../services/supabaseService';
import { QuestType, QuestStatus, User, QuestVisibilityScope } from '../types';
import { useToast } from './Toast';
import MapPicker from './MapPicker';

interface CreateQuestScreenProps {
    onClose: () => void;
    onQuestCreated?: (id: string, title: string) => void;
    currentUser: User;
}

const AestheticDatePicker: React.FC<{
    value: Date;
    onChange: (date: Date) => void;
    onClose: () => void;
}> = ({ value, onChange, onClose }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date(value.getFullYear(), value.getMonth(), 1));
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-sm shadow-3xl"
        >
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
                    {monthNames[currentMonth.getMonth()].toUpperCase()} {currentMonth.getFullYear()}
                </h3>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 text-gray-500 hover:text-white transition-colors"><ChevronLeft size={20} /></button>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 text-gray-500 hover:text-white transition-colors"><ChevronRight size={20} /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-4 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <span key={d} className="text-[10px] font-black text-gray-700 uppercase">{d}</span>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                    if (day === null) return <div key={`empty-${i}`} />;
                    const isSelected = value.getDate() === day && value.getMonth() === currentMonth.getMonth() && value.getFullYear() === currentMonth.getFullYear();
                    return (
                        <button
                            key={day}
                            onClick={() => {
                                const newDate = new Date(currentMonth);
                                newDate.setDate(day);
                                onChange(newDate);
                            }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${isSelected ? 'bg-primary text-black shadow-[0_0_15px_rgba(204,255,0,0.4)]' : 'text-gray-400 hover:bg-white/5'}`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
            <div className="mt-8 flex gap-4">
                <button onClick={onClose} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Cancel</button>
                <button onClick={onClose} className="flex-1 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Done</button>
            </div>
        </motion.div>
    );
};

const AestheticTimePicker: React.FC<{
    value: string;
    onChange: (time: string) => void;
    onClose: () => void;
}> = ({ value, onChange, onClose }) => {
    const [h, m] = value.split(':').map(Number);
    const [hour, setHour] = useState(h > 12 ? h - 12 : h === 0 ? 12 : h);
    const [minute, setMinute] = useState(Math.floor(m / 5) * 5);
    const [ampm, setAmPm] = useState(h >= 12 ? 'PM' : 'AM');

    const handleConfirm = () => {
        let finalH = hour;
        if (ampm === 'PM' && hour < 12) finalH += 12;
        if (ampm === 'AM' && hour === 12) finalH = 0;
        onChange(`${finalH.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-sm shadow-3xl"
        >
            <div className="text-center mb-8"><h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Select Time</h3></div>
            <div className="flex flex-col items-center gap-8 mb-8">
                <div className="flex items-center gap-4 text-5xl font-black italic text-white">
                    <span>{hour.toString().padStart(2, '0')}</span>
                    <span className="text-gray-800">:</span>
                    <span>{minute.toString().padStart(2, '0')}</span>
                    <div className="ml-2 text-sm bg-white/10 px-3 py-1.5 rounded-xl font-black uppercase tracking-widest text-primary">{ampm}</div>
                </div>
                <div className="flex gap-12 text-sm font-black text-gray-700 uppercase tracking-widest">
                    <div className="h-32 overflow-y-auto no-scrollbar py-12 flex flex-col gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(hr => (
                            <button key={hr} onClick={() => setHour(hr)} className={`transition-all ${hour === hr ? 'text-white scale-125' : 'opacity-20'}`}>{hr}</button>
                        ))}
                    </div>
                    <div className="h-32 overflow-y-auto no-scrollbar py-12 flex flex-col gap-4">
                        {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(min => (
                            <button key={min} onClick={() => setMinute(min)} className={`transition-all ${minute === min ? 'text-white scale-125' : 'opacity-20'}`}>{min.toString().padStart(2, '0')}</button>
                        ))}
                    </div>
                    <div className="flex flex-col gap-4 justify-center">
                        <button onClick={() => setAmPm('AM')} className={`transition-all ${ampm === 'AM' ? 'text-white' : 'opacity-20'}`}>AM</button>
                        <button onClick={() => setAmPm('PM')} className={`transition-all ${ampm === 'PM' ? 'text-white' : 'opacity-20'}`}>PM</button>
                    </div>
                </div>
            </div>
            <div className="flex gap-4">
                <button onClick={onClose} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Cancel</button>
                <button onClick={handleConfirm} className="flex-1 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Set Time</button>
            </div>
        </motion.div>
    );
};

const SlideToLaunch: React.FC<{ onLaunch: () => void, loading: boolean }> = ({ onLaunch, loading }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const x = useMotionValue(0);

    useEffect(() => {
        const updateWidth = () => { if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth); };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const maxDrag = Math.max(containerWidth - 72, 100);
    const progress = useTransform(x, [0, maxDrag], [0, 1]);
    const textOpacity = useTransform(x, [0, maxDrag * 0.3], [1, 0]);
    const iconRotate = useTransform(x, [0, maxDrag], [0, 360]);

    const handleDragEnd = () => {
        if (x.get() > maxDrag * 0.85) onLaunch();
        else x.set(0);
    };

    return (
        <div ref={containerRef} className="w-full h-18 rounded-[2.2rem] bg-white/5 border border-white/10 relative flex items-center px-1.5 overflow-hidden backdrop-blur-3xl group shadow-2xl">
            <motion.div style={{ opacity: useTransform(x, [0, maxDrag], [0.05, 0.4]), width: x, background: 'linear-gradient(90deg, transparent, rgba(204,255,0,0.6))' }} className="absolute inset-y-0 left-0 pointer-events-none rounded-l-full" />
            <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.6em] ml-14 italic">{loading ? 'LAUNCHING...' : 'SLIDE TO DEPLOY'}</span>
                    {!loading && <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ArrowRight size={14} className="text-primary/30" /></motion.div>}
                </div>
            </motion.div>
            <motion.div
                drag={loading ? false : "x"}
                dragConstraints={{ left: 0, right: maxDrag }}
                dragElastic={0.05}
                style={{ x }}
                onDragEnd={handleDragEnd}
                className="w-14 h-14 rounded-[1.4rem] bg-white flex items-center justify-center text-black z-20 shadow-xl cursor-grab active:cursor-grabbing border-2 border-white/40 relative"
            >
                {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-7 h-7 border-3 border-black border-t-transparent rounded-full" /> : <Zap size={26} fill="black" strokeWidth={2.5} />}
            </motion.div>
        </div>
    );
};

const CreateQuestScreen: React.FC<CreateQuestScreenProps> = ({ onClose, onQuestCreated, currentUser }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const totalSteps = 3;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [activity, setActivity] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [startTime, setStartTime] = useState('12:00');
    const [endTime, setEndTime] = useState('14:00');
    const [locationName, setLocationName] = useState('TBD');
    const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [capacity, setCapacity] = useState(10);
    const [requiresApproval, setRequiresApproval] = useState(false);
    const [visibility, setVisibility] = useState<QuestVisibilityScope>(QuestVisibilityScope.PUBLIC);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);

    const categories = [
        { name: 'Sports', icon: Trophy },
        { name: 'Social', icon: MessageSquare },
        { name: 'Events', icon: CalendarDays },
        { name: 'Adventure', icon: Compass }
    ];

    const activities: Record<string, string[]> = {
        Sports: ['Pickleball', 'Basketball', 'Tennis', 'Gym', 'Running'],
        Social: ['Coffee', 'Drinks', 'Dinner', 'Study'],
        Events: ['Party', 'Concert', 'Workshop'],
        Adventure: ['Hiking', 'Road Trip', 'Exploration']
    };

    const handleLaunch = async () => {
        if (!title || !category || !activity) return;
        setLoading(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const startDateTime = new Date(`${dateStr}T${startTime}`);
            const endDateTime = new Date(`${dateStr}T${endTime}`);

            const questData = {
                title,
                category,
                activity,
                description,
                type: QuestType.CANON,
                is_public: visibility === QuestVisibilityScope.PUBLIC,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                location: locationName,
                location_coords: locationCoords ? { lat: locationCoords.latitude, lng: locationCoords.longitude, place_name: locationName } : null,
                max_participants: capacity,
                requires_approval: requiresApproval,
                host_id: currentUser.id,
                status: QuestStatus.DISCOVERABLE,
                aura_reward: 100,
                exp_reward: 120
            };

            const response = await supabaseService.quests.createQuest(questData);
            if (response.success) {
                showToast("Quest Deployed! 🚀", "success");
                onQuestCreated?.(response.questId!, title);
                onClose();
            } else {
                showToast("Deployment failed.", "error");
            }
        } catch (e) {
            showToast("System error.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-xl" />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-xl bg-[#050505] border border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-3xl h-[80vh] max-h-[800px]"
            >
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex justify-between items-center bg-gradient-to-b from-white/[0.02] to-transparent">
                    <div className="flex items-center gap-4">
                        <button onClick={step === 1 ? onClose : () => setStep(step - 1)} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">New Activity</h2>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Stage {step} of {totalSteps}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-6">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Title</label>
                                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mission Title..." className="w-full bg-transparent text-4xl font-black italic uppercase text-white placeholder-white/5 outline-none border-b border-white/5 pb-4 focus:border-primary/50 transition-all" autoFocus />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Category</label>
                                    <div className="flex gap-3 overflow-x-auto no-scrollbar">
                                        {categories.map(cat => (
                                            <button key={cat.name} onClick={() => setCategory(cat.name)} className={`flex-none w-24 h-28 rounded-3xl border flex flex-col items-center justify-center gap-2 transition-all ${category === cat.name ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                                                <cat.icon size={22} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {category && (
                                    <div className="space-y-3 animate-in fade-in">
                                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Activity</label>
                                        <div className="flex flex-wrap gap-2 text-white">
                                            {activities[category].map(act => (
                                                <button key={act} onClick={() => setActivity(act)} className={`px-5 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${activity === act ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'}`}>{act}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Description</label>
                                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's the plan?..." className="w-full bg-white/5 border border-white/5 rounded-3xl p-6 text-sm text-gray-300 min-h-[120px] outline-none focus:border-white/10" />
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div onClick={() => setShowMapPicker(true)} className="h-48 rounded-[2.5rem] bg-white/5 border border-white/5 relative overflow-hidden group cursor-pointer">
                                    {locationCoords ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-primary/5">
                                            <MapPin size={32} className="text-primary mb-2" />
                                            <p className="text-sm font-black text-white uppercase text-center">{locationName}</p>
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <MapPin size={32} className="text-gray-700 opacity-50 mb-2" />
                                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Select Location</p>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div onClick={() => setShowDatePicker(true)} className="col-span-2 p-5 rounded-3xl bg-white/5 border border-white/5 cursor-pointer flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <Calendar size={18} className="text-gray-500 group-hover:text-primary" />
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Date</span>
                                        </div>
                                        <span className="text-white font-black">{selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <div onClick={() => setShowStartTimePicker(true)} className="p-5 rounded-3xl bg-white/5 border border-white/5 cursor-pointer flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck size={18} className="text-gray-500 group-hover:text-primary" />
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Start</span>
                                        </div>
                                        <span className="text-white font-black">{startTime}</span>
                                    </div>
                                    <div onClick={() => setShowEndTimePicker(true)} className="p-5 rounded-3xl bg-white/5 border border-white/5 cursor-pointer flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <Clock size={18} className="text-gray-500 group-hover:text-primary" />
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">End</span>
                                        </div>
                                        <span className="text-white font-black">{endTime}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="p-6 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-white font-black uppercase italic tracking-widest">Private Activity</p>
                                            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em]">Hidden from discovery</p>
                                        </div>
                                        <button onClick={() => setVisibility(visibility === QuestVisibilityScope.PUBLIC ? QuestVisibilityScope.FRIENDS : QuestVisibilityScope.PUBLIC)} className={`w-12 h-7 rounded-full transition-all relative ${visibility === QuestVisibilityScope.FRIENDS ? 'bg-primary' : 'bg-white/10'}`}>
                                            <div className={`absolute top-1 left-1 w-5 h-5 bg-black rounded-full transition-all ${visibility === QuestVisibilityScope.FRIENDS ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center pt-6 border-t border-white/5">
                                        <div>
                                            <p className="text-white font-black uppercase italic tracking-widest">Approval Hub</p>
                                            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em]">Manually review joiners</p>
                                        </div>
                                        <button onClick={() => setRequiresApproval(!requiresApproval)} className={`w-12 h-7 rounded-full transition-all relative ${requiresApproval ? 'bg-primary' : 'bg-white/10'}`}>
                                            <div className={`absolute top-1 left-1 w-5 h-5 bg-black rounded-full transition-all ${requiresApproval ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center pt-6 border-t border-white/5">
                                        <div>
                                            <p className="text-white font-black uppercase italic tracking-widest">Squad Size</p>
                                            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em]">Max participants</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-black/40 rounded-2xl p-1 border border-white/5">
                                            <button onClick={() => setCapacity(Math.max(2, capacity - 1))} className="p-2 text-gray-500 hover:text-white"><Minus size={16} /></button>
                                            <span className="text-white font-black w-8 text-center">{capacity}</span>
                                            <button onClick={() => setCapacity(Math.min(50, capacity + 1))} className="p-2 text-gray-500 hover:text-white"><Plus size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-10">
                                    <SlideToLaunch onLaunch={handleLaunch} loading={loading} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Nav */}
                <div className="p-8 bg-gradient-to-t from-white/[0.02] to-transparent">
                    {step < totalSteps && (
                        <button
                            onClick={() => {
                                if (step === 1 && (!title || !category || !activity)) { showToast("Complete all fields.", "info"); return; }
                                setStep(step + 1);
                            }}
                            className="w-full py-5 rounded-[1.8rem] bg-white text-black font-black uppercase italic tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-2xl"
                        >
                            Next Stage <ArrowRight size={20} />
                        </button>
                    )}
                </div>

                {/* Modals */}
                <AnimatePresence>
                    {showDatePicker && <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/95 p-6"><AestheticDatePicker value={selectedDate} onChange={setSelectedDate} onClose={() => setShowDatePicker(false)} /></div>}
                    {showStartTimePicker && <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/95 p-6"><AestheticTimePicker value={startTime} onChange={setStartTime} onClose={() => setShowStartTimePicker(false)} /></div>}
                    {showEndTimePicker && <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/95 p-6"><AestheticTimePicker value={endTime} onChange={setEndTime} onClose={() => setShowEndTimePicker(false)} /></div>}
                    {showMapPicker && <div className="absolute inset-0 z-[60] bg-black"><MapPicker onSelect={(loc, addr) => { setLocationCoords(loc); setLocationName(addr); setShowMapPicker(false); }} onClose={() => setShowMapPicker(false)} /></div>}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default CreateQuestScreen;
