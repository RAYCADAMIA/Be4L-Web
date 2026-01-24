import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Calendar, Users, MapPin, Zap, ArrowRight, ChevronLeft, Target, Coffee, Dumbbell, Music, Gamepad2, Mountain,
    Camera, Trophy, Clock, Globe, Lock, UserPlus, Plus, Minus, Check, ChevronDown, Activity as ActivityIcon,
    Sparkles, ShieldCheck, DollarSign, MoreHorizontal, Navigation, CalendarDays, Timer, Search, AlertCircle,
    ChevronRight, Ticket, Plane, Dumbbell as TrainIcon, PartyPopper, MessageSquare, Compass, Sliders, Play, MoveRight
} from 'lucide-react';
import { useMotionValue, useTransform } from 'framer-motion';
import { supabaseService } from '../services/supabaseService';
import { QuestType, QuestStatus, User, QuestVisibilityScope } from '../types';
import { useToast } from './Toast';
import MapPicker from './MapPicker';
import { GradientButton, GlassCard } from './ui/AestheticComponents';

interface CreateQuestScreenProps {
    onClose: () => void;
    onQuestCreated?: (id: string, title: string) => void;
    currentUser: User;
}

// --- Custom Components for Enhanced UI ---

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
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 text-gray-500 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 text-gray-500 hover:text-white transition-colors">
                        <ChevronRight size={20} />
                    </button>
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
    value: string; // HH:mm
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
            <div className="text-center mb-8">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Select Time</h3>
            </div>

            <div className="flex flex-col items-center gap-8 mb-8">
                <div className="flex items-center gap-4 text-5xl font-black italic text-white">
                    <div className="flex flex-col items-center">
                        <span>{hour.toString().padStart(2, '0')}</span>
                    </div>
                    <span className="text-gray-800">:</span>
                    <div className="flex flex-col items-center">
                        <span>{minute.toString().padStart(2, '0')}</span>
                    </div>
                    <div className="ml-2 text-sm bg-white/10 px-3 py-1.5 rounded-xl font-black uppercase tracking-widest text-primary">
                        {ampm}
                    </div>
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
                <button onClick={handleConfirm} className="flex-1 py-4 bg-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Set Time</button>
            </div>
        </motion.div>
    );
};

const SlideToLaunch: React.FC<{ onLaunch: () => void, loading: boolean }> = ({ onLaunch, loading }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const x = useMotionValue(0);

    // Dynamic width detection for different screen sizes
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Interactive Values
    const maxDrag = Math.max(containerWidth - 72, 100);
    const progress = useTransform(x, [0, maxDrag], [0, 1]);
    const glowScale = useTransform(x, [0, maxDrag], [1, 1.4]);
    const textOpacity = useTransform(x, [0, maxDrag * 0.3], [1, 0]);
    const iconRotate = useTransform(x, [0, maxDrag], [0, 360]);

    const handleDragEnd = () => {
        if (x.get() > maxDrag * 0.85) {
            onLaunch();
        } else {
            // Spring back for tactile feel
            x.set(0);
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-18 rounded-[2.2rem] bg-white/5 border border-white/10 relative flex items-center px-1.5 overflow-hidden backdrop-blur-3xl group shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
            {/* Energy Flux Track */}
            <motion.div
                style={{
                    opacity: useTransform(x, [0, maxDrag], [0.05, 0.4]),
                    width: x,
                    background: 'linear-gradient(90deg, transparent, rgba(204,255,0,0.6))'
                }}
                className="absolute inset-y-0 left-0 pointer-events-none rounded-l-full"
            />

            {/* Floating Instructional Text */}
            <motion.div
                style={{ opacity: textOpacity }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.6em] ml-14 italic">
                        {loading ? 'INITIATING...' : 'SLIDE TO DEPLOY'}
                    </span>
                    {!loading && (
                        <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            <ArrowRight size={14} className="text-primary/30" />
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* The Warp Drive Handle */}
            <motion.div
                drag={loading ? false : "x"}
                dragConstraints={{ left: 0, right: maxDrag }}
                dragElastic={0.05}
                dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                style={{ x }}
                onDragEnd={handleDragEnd}
                className="w-14 h-14 rounded-[1.4rem] bg-primary flex items-center justify-center text-black z-20 shadow-[0_0_40px_rgba(204,255,0,0.5)] cursor-grab active:cursor-grabbing border-2 border-white/40 overflow-hidden relative"
            >
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loader"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: 360 }}
                            exit={{ scale: 0 }}
                            transition={{ rotate: { repeat: Infinity, duration: 1, ease: "linear" } }}
                            className="w-7 h-7 border-3 border-black border-t-transparent rounded-full"
                        />
                    ) : (
                        <motion.div
                            key="icon"
                            style={{ rotate: iconRotate, scale: glowScale }}
                            className="flex items-center justify-center"
                        >
                            <Zap size={26} fill="black" strokeWidth={2.5} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Secondary Internal Glow */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/30 blur-sm pointer-events-none" />
            </motion.div>

            <div className="flex-1 px-12 pointer-events-none flex items-center justify-end">
                {!loading && (
                    <div className="flex gap-1.5 opacity-20 group-hover:opacity-100 transition-opacity">
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                animate={{ opacity: [0.2, 1, 0.2] }}
                                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const CreateQuestScreen: React.FC<CreateQuestScreenProps> = ({ onClose, onQuestCreated, currentUser }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const totalSteps = 4; // Refactored to 4 Stages

    // --- Form State ---
    const [questMode, setQuestMode] = useState<QuestType | null>(null);
    const [visibility, setVisibility] = useState<QuestVisibilityScope>(QuestVisibilityScope.PUBLIC);
    const [category, setCategory] = useState<string>('');
    const [activity, setActivity] = useState<string>('');
    const [customActivity, setCustomActivity] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // Time
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [startTime, setStartTime] = useState<string>('12:00');
    const [endTime, setEndTime] = useState<string>('13:30');
    const [durationHours, setDurationHours] = useState(2); // For Sponty

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    // Location
    const [locationName, setLocationName] = useState('TBD');
    const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [showMapPicker, setShowMapPicker] = useState(false);

    // Gate
    const [capacity, setCapacity] = useState<number>(5);
    const [requiresApproval, setRequiresApproval] = useState(false);
    const [minAura, setMinAura] = useState<number>(0);
    const [socialSignals, setSocialSignals] = useState<string[]>([]);
    const [vibeSignals, setVibeSignals] = useState<string[]>([]);


    // Constants
    const categories = [
        { name: 'Sports', icon: Dumbbell, color: 'text-primary' },
        { name: 'Events', icon: PartyPopper, color: 'text-blue-400' },
        { name: 'Socials', icon: MessageSquare, color: 'text-pink-400' },
        { name: 'Adventure', icon: Mountain, color: 'text-green-400' },
        { name: 'Travel', icon: Plane, color: 'text-purple-400' },
        { name: 'Train', icon: TrainIcon, color: 'text-orange-400' },
        { name: 'Jobs', icon: Trophy, color: 'text-yellow-400' },
        { name: 'Others', icon: MoreHorizontal, color: 'text-gray-400' }
    ];

    const activitiesMap: Record<string, string[]> = {
        Sports: ['Pickleball', 'Basketball', 'Tennis', 'Gym', 'Running', 'Soccer', 'Badminton', 'Padel'],
        Events: ['Party', 'Concert', 'Festival', 'Workshop', 'Meetup', 'Launch', 'Pop-up'],
        Socials: ['Coffee', 'Drinks', 'Brunch', 'Dinner', 'Chill', 'Catch-up', 'Study'],
        Adventure: ['Hiking', 'Climbing', 'Surfing', 'Camping', 'Road Trip', 'Exploration'],
        Travel: ['Day Trip', 'Staycation', 'Backpacking', 'Weekend Getaway', 'City Trip'],
        Train: ['HIIT', 'Yoga', 'Pilates', 'Crossfit', 'Drills', 'Sparring', 'Session'],
        Jobs: ['Tutor', 'Assistance', 'Gig', 'Task', 'Event Crew', 'Campus Courier'],
        Others: ['Random', 'Gaming', 'Creative', 'Custom']
    };

    const socialTags = ['Ladies Only', 'The Boys', 'Couples', 'Solo Friendly', 'Group', 'Mixed'];
    const vibeTags = ['21+', 'Students', 'Chill', 'High Energy', 'Competitive', 'Beginner Friendly', 'Expert', 'Networking'];

    // --- Auto Generation ---
    useEffect(() => {
        if (activity && category && !title) {
            const prefixes = ['The', 'Official', 'Late Night', 'Morning', 'Weekend', 'Elite'];
            const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            setTitle(`${randomPrefix} ${activity}`);
        }
    }, [activity, category]);

    // --- Steps Navigation ---
    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
        else onClose();
    };

    // --- Final Launch ---
    const handleLaunch = async () => {
        if (!title || !category || !activity || !questMode) return;

        setLoading(true);
        try {
            let startDateTime: Date;
            let endDateTime: Date;

            const dateStr = selectedDate.toISOString().split('T')[0];

            if (questMode === QuestType.SPONTY) {
                startDateTime = new Date(); // Now
                endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000);
            } else {
                startDateTime = new Date(`${dateStr}T${startTime}`);
                endDateTime = new Date(`${dateStr}T${endTime}`);
                // If end time is before start time, assume it's next day
                if (endDateTime < startDateTime) {
                    endDateTime.setDate(endDateTime.getDate() + 1);
                }
            }

            const finalActivity = activity === 'Custom' ? customActivity : activity;

            const questData: any = {
                title,
                category,
                activity: finalActivity,
                description,
                type: questMode, // DB uses 'type', not 'mode'
                is_public: visibility === QuestVisibilityScope.PUBLIC,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                location: locationName, // DB expects text
                location_coords: { // DB expects jsonb
                    lat: locationCoords?.latitude || 0,
                    lng: locationCoords?.longitude || 0,
                    place_name: locationName,
                    address_full: locationName
                },
                max_participants: capacity >= 50 ? 100 : capacity, // DB uses max_participants
                current_participants: 1,
                status: QuestStatus.DISCOVERABLE,
                requires_approval: requiresApproval, // DB uses requires_approval
                signals: [...socialSignals, ...vibeSignals], // DB uses ARRAY
                host_id: currentUser.id,
                created_by: currentUser.id,
                aura_reward: questMode === QuestType.SPONTY ? 150 : 100,
                exp_reward: questMode === QuestType.SPONTY ? 250 : 120,
            };

            const response = await supabaseService.quests.createQuest(questData);
            if (response.success) {
                showToast("Mission Deployed! 🚀", "success");
                if (onQuestCreated && response.questId) onQuestCreated(response.questId, title);
                onClose();
            } else {
                showToast(`Launch Failed: ${response.error || "Check coms."}`, "error");
            }

        } catch (e) {
            console.error(e);
            showToast("System Error", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- Render Stages ---
    const renderStage = () => {
        switch (step) {
            case 1: // THE CONTEXT
                return (
                    <div className="h-full flex flex-col p-6 space-y-6">
                        <div className="flex-1 space-y-4">
                            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Select Operation Mode</h2>

                            <div className="grid grid-cols-2 gap-4 h-[60%]">
                                <div
                                    onClick={() => setQuestMode(QuestType.SPONTY)}
                                    className={`relative p-6 rounded-[2rem] border transition-all cursor-pointer overflow-hidden flex flex-col justify-between group ${questMode === QuestType.SPONTY ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <Zap size={28} fill={questMode === QuestType.SPONTY ? "black" : "none"} />
                                        {questMode === QuestType.SPONTY && <div className="w-3 h-3 bg-black rounded-full animate-pulse" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase italic tracking-tighter mb-1">Sponty</h3>
                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${questMode === QuestType.SPONTY ? 'text-black/70' : 'text-gray-600'}`}>Happening Now (Active)</p>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setQuestMode(QuestType.CANON)}
                                    className={`relative p-6 rounded-[2rem] border transition-all cursor-pointer overflow-hidden flex flex-col justify-between group ${questMode === QuestType.CANON ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <CalendarDays size={28} />
                                        {questMode === QuestType.CANON && <div className="w-3 h-3 bg-white rounded-full" />}
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-black uppercase italic tracking-tighter mb-1 ${questMode === QuestType.CANON ? 'text-white' : ''}`}>Canon</h3>
                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${questMode === QuestType.CANON ? 'text-white/70' : 'text-gray-600'}`}>Scheduled Operation</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-[30%] bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 flex flex-col justify-center">
                            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Transmission Scope</h2>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setVisibility(QuestVisibilityScope.PUBLIC)}
                                    className={`flex-1 p-4 rounded-2xl border flex items-center gap-3 transition-all ${visibility === QuestVisibilityScope.PUBLIC ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-gray-600'}`}
                                >
                                    <Globe size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Global Frequency</span>
                                </button>
                                <button
                                    onClick={() => setVisibility(QuestVisibilityScope.FRIENDS)}
                                    className={`flex-1 p-4 rounded-2xl border flex items-center gap-3 transition-all ${visibility === QuestVisibilityScope.FRIENDS ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-gray-600'}`}
                                >
                                    <Lock size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Encrypted / Friends</span>
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 2: // THE DIRECTIVE
                return (
                    <div className="h-full overflow-y-auto p-6 space-y-8 no-scrollbar pb-32">
                        {/* Title Input */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Mission Brief</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="OPERATION NAME..."
                                className="w-full bg-transparent text-3xl font-black italic uppercase text-white placeholder-white/10 outline-none border-b border-white/10 pb-4 focus:border-primary/50 transition-colors"
                                autoFocus
                            />
                        </div>

                        {/* Sector Grid */}
                        <div className="space-y-4">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Target Sector</label>
                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.name}
                                        onClick={() => setCategory(cat.name)}
                                        className={`flex-none w-20 h-24 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${category === cat.name ? 'bg-white/10 border-white/20 text-white' : 'bg-white/[0.02] border-white/5 text-gray-600 hover:bg-white/5'}`}
                                    >
                                        <cat.icon size={20} />
                                        <span className="text-[8px] font-black uppercase tracking-widest">{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Protocol (Activity) */}
                        {category && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Protocol</label>
                                <div className="flex flex-wrap gap-2">
                                    {activitiesMap[category]?.map((act) => (
                                        <button
                                            key={act}
                                            onClick={() => setActivity(act)}
                                            className={`px-4 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${activity === act ? 'bg-white text-black border-white' : 'bg-white/[0.02] border-white/5 text-gray-500 hover:text-white'}`}
                                        >
                                            {act}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setActivity('Custom')}
                                        className={`px-4 py-3 rounded-xl border border-dashed text-[9px] font-black uppercase tracking-widest transition-all ${activity === 'Custom' ? 'bg-primary/20 text-primary border-primary' : 'border-white/10 text-gray-600'}`}
                                    >
                                        + Custom
                                    </button>
                                </div>
                                {activity === 'Custom' && (
                                    <input
                                        type="text"
                                        value={customActivity}
                                        onChange={(e) => setCustomActivity(e.target.value)}
                                        placeholder="DEFINE PROTOCOL..."
                                        className="w-full bg-white/[0.03] text-sm font-bold uppercase text-white placeholder-white/20 outline-none border border-white/10 rounded-xl p-4 focus:border-primary/30"
                                        autoFocus
                                    />
                                )}
                            </div>
                        )}

                        {/* Description */}
                        <div className="space-y-4 pt-4">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Briefing</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="ADDITIONAL INTEL..."
                                className="w-full bg-white/[0.02] text-sm font-medium text-gray-300 placeholder-white/10 outline-none border border-white/5 rounded-2xl p-4 h-32 resize-none focus:border-primary/20"
                            />
                        </div>
                    </div>
                );

            case 3: // THE RENDEZVOUS
                return (
                    <div className="h-full flex flex-col p-4 gap-4">
                        {/* Map Section */}
                        <div className="flex-1 rounded-[2.5rem] overflow-hidden border border-white/10 relative group">
                            {/* Integrated Search Bar */}
                            <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
                                <div className="flex-1 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 flex items-center px-4 h-12">
                                    <Search size={16} className="text-gray-400 mr-3" />
                                    <input
                                        type="text"
                                        placeholder="SEARCH GRID..."
                                        value={locationName === 'TBD' ? '' : locationName}
                                        onChange={(e) => setLocationName(e.target.value)}
                                        className="bg-transparent w-full text-[10px] font-black uppercase tracking-widest text-white outline-none placeholder-gray-600"
                                    />
                                </div>
                                <button className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center text-primary" onClick={() => setShowMapPicker(true)}>
                                    <Compass size={20} />
                                </button>
                            </div>

                            {/* Map View / TBD Fallback */}
                            {!locationCoords ? (
                                <div className="absolute inset-0 bg-white/[0.02] flex flex-col items-center justify-center">
                                    <MapPin size={40} className="text-gray-700 opacity-50 mb-4" />
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No Coordinates Set</p>
                                    <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mt-1">Status: TBD</p>
                                </div>
                            ) : (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    title="map"
                                    frameBorder="0"
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${locationCoords.longitude - 0.005}%2C${locationCoords.latitude - 0.005}%2C${locationCoords.longitude + 0.005}%2C${locationCoords.latitude + 0.005}&layer=mapnik&marker=${locationCoords.latitude}%2C${locationCoords.longitude}`}
                                    className="w-full h-full grayscale invert contrast-[1.1] opacity-60"
                                />
                            )}
                            {/* Map Overlay to prevent interaction issues if needed, or allow click to open full picker */}
                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                        </div>

                        {/* Map Picker Modal (Overlay) - Needs to be conditioned if inline isnt enough */}
                        {showMapPicker && (
                            <div className="absolute inset-0 z-50 bg-black">
                                <MapPicker
                                    onSelect={(loc, addr) => {
                                        setLocationCoords(loc);
                                        setLocationName(addr);
                                        setShowMapPicker(false);
                                    }}
                                    onClose={() => setShowMapPicker(false)}
                                />
                            </div>
                        )}


                        {/* Time Controls */}
                        <div className="h-[40%] bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 space-y-6">
                            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-center">Sync Timeline</h2>

                            {questMode === QuestType.SPONTY ? (
                                <div className="space-y-8 px-4">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Active Window</label>
                                        <span className="text-3xl font-black italic text-primary">{durationHours}h</span>
                                    </div>
                                    <input
                                        type="range" min="0.5" max="6" step="0.5"
                                        value={durationHours}
                                        onChange={(e) => setDurationHours(Number(e.target.value))}
                                        className="w-full accent-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[8px] font-black text-gray-700 uppercase tracking-widest">
                                        <span>30m</span>
                                        <span>6h</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div onClick={() => setShowDatePicker(true)} className="col-span-2 bg-white/5 p-4 rounded-2xl flex justify-between items-center cursor-pointer">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Date</span>
                                        <span className="text-white font-bold">{selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                    <div onClick={() => setShowStartTimePicker(true)} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center cursor-pointer">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Start</span>
                                        <span className="text-white font-bold">{startTime}</span>
                                    </div>
                                    <div onClick={() => setShowEndTimePicker(true)} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center cursor-pointer">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">End</span>
                                        <span className="text-white font-bold">{endTime}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modals for Time/Date */}
                        <AnimatePresence>
                            {showDatePicker && (
                                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
                                    <AestheticDatePicker value={selectedDate} onChange={setSelectedDate} onClose={() => setShowDatePicker(false)} />
                                </div>
                            )}
                            {showStartTimePicker && (
                                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
                                    <AestheticTimePicker value={startTime} onChange={setStartTime} onClose={() => setShowStartTimePicker(false)} />
                                </div>
                            )}
                            {showEndTimePicker && (
                                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
                                    <AestheticTimePicker value={endTime} onChange={setEndTime} onClose={() => setShowEndTimePicker(false)} />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                );

            case 4: // THE GATE
                return (
                    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto no-scrollbar pb-32">
                        {/* Header */}
                        <div className="text-center">
                            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Final Protocols</h2>
                        </div>

                        {/* Access Rules */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-white font-black uppercase italic">Review Joiners</p>
                                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Manual Approval</p>
                                </div>
                                <button
                                    onClick={() => setRequiresApproval(!requiresApproval)}
                                    className={`w-12 h-7 rounded-full transition-all relative ${requiresApproval ? 'bg-primary' : 'bg-gray-800'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-5 h-5 bg-black rounded-full transition-all ${requiresApproval ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                <div>
                                    <p className="text-white font-black uppercase italic">Max Agents</p>
                                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Capacity</p>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 rounded-xl p-1">
                                    <button onClick={() => setCapacity(Math.max(2, capacity - 1))} className="p-2 text-gray-500"><Minus size={14} /></button>
                                    <span className="text-white font-black w-8 text-center">{capacity >= 50 ? '∞' : capacity}</span>
                                    <button onClick={() => setCapacity(Math.min(50, capacity + 1))} className="p-2 text-gray-500"><Plus size={14} /></button>
                                </div>
                            </div>

                            {/* Aura Gate */}
                            <div className="pt-4 border-t border-white/5 space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <p className="text-white font-black uppercase italic tracking-tighter">Aura Requirement</p>
                                        <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Minimal reputation to join</p>
                                    </div>
                                    <span className="text-primary font-black text-lg tracking-tighter">{minAura > 0 ? `${minAura}+` : 'None'}</span>
                                </div>
                                <div className="relative h-12 flex items-center group">
                                    {/* Custom Track */}
                                    <div className="absolute inset-x-0 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={false}
                                            animate={{ width: `${(minAura / 5000) * 100}%` }}
                                            className="h-full bg-primary shadow-[0_0_15px_rgba(204,255,0,0.5)]"
                                        />
                                    </div>
                                    <input
                                        type="range" min="0" max="5000" step="100"
                                        value={minAura}
                                        onChange={(e) => setMinAura(Number(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    />
                                    {/* The Thumb Mirror (Aesthetic Only) */}
                                    <motion.div
                                        initial={false}
                                        animate={{ left: `${(minAura / 5000) * 100}%` }}
                                        className="absolute w-6 h-6 bg-primary rounded-full -ml-3 pointer-events-none z-10 shadow-[0_0_20px_rgba(204,255,0,0.8)] border-4 border-black"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Signals */}
                        <div className="space-y-4">
                            <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Target Signal (Tags)</h3>

                            <div className="space-y-3">
                                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Social</p>
                                <div className="flex flex-wrap gap-2">
                                    {socialTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => {
                                                if (socialSignals.includes(tag)) setSocialSignals(prev => prev.filter(t => t !== tag));
                                                else setSocialSignals(prev => [...prev, tag]);
                                            }}
                                            className={`px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${socialSignals.includes(tag) ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-gray-600'}`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 mt-4">
                                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Vibe</p>
                                <div className="flex flex-wrap gap-2">
                                    {vibeTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => {
                                                if (vibeSignals.includes(tag)) setVibeSignals(prev => prev.filter(t => t !== tag));
                                                else setVibeSignals(prev => [...prev, tag]);
                                            }}
                                            className={`px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${vibeSignals.includes(tag) ? 'bg-primary/20 text-primary border-primary/30' : 'bg-transparent border-white/10 text-gray-600'}`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Preview Card */}
                        <div className="bg-white/5 rounded-3xl p-4 flex gap-4 items-center opacity-60">
                            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                                {category ?
                                    React.createElement(categories.find(c => c.name === category)?.icon || ActivityIcon, { size: 20, className: "text-gray-400" })
                                    : <ActivityIcon size={20} className="text-gray-400" />}
                            </div>
                            <div>
                                <p className="text-white font-bold uppercase text-sm">{title || "Mission Name"}</p>
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest">{locationName}</p>
                            </div>
                        </div>
                        <p className="text-[8px] text-center text-gray-600 font-bold uppercase tracking-widest">PREVIEW</p>
                    </div>
                );

            default: return null;
        }
    };

    // --- Validation for Next ---
    const canIsProceed = () => {
        switch (step) {
            case 1: return questMode !== null; // Scope has default
            case 2: return !!title && !!category && !!activity;
            case 3: return true; // TBD is valid, time has defaults
            case 4: return true;
            default: return false;
        }
    };

    return (
        <div className="absolute inset-0 z-[70] bg-[#050505] flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="h-20 px-6 flex items-center justify-between border-b border-white/5">
                <button onClick={onClose} className="p-2 -ml-2 text-gray-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                        <ActivityIcon size={10} />
                        Quest Builder
                    </span>
                    <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className={`h-1 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-primary' : s < step ? 'w-2 bg-primary/30' : 'w-2 bg-gray-800'}`} />
                        ))}
                    </div>
                </div>
                <div className="w-8" /> {/* Balance */}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {renderStage()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer / Action */}
            <div className="h-24 px-6 mb-6 flex items-center justify-center">
                {step < totalSteps ? (
                    <button
                        onClick={nextStep}
                        disabled={!canIsProceed()}
                        className={`w-full h-14 rounded-full font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2 ${canIsProceed() ? 'bg-white text-black hover:scale-[1.02] active:scale-[0.98]' : 'bg-gray-900 text-gray-600'}`}
                    >
                        Continue <ArrowRight size={16} />
                    </button>
                ) : (
                    <SlideToLaunch onLaunch={handleLaunch} loading={loading} />
                )}
            </div>
        </div>
    );
};

export default CreateQuestScreen;
