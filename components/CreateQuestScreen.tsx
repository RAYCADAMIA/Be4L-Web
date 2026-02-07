import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Calendar, MapPin, Zap, ArrowRight, ChevronLeft, CalendarDays,
    ChevronRight, MessageSquare, Compass, Plus, Minus, ShieldCheck, Trophy, Clock,
    Briefcase, Dumbbell, LayoutGrid, Plane, ChevronDown, MonitorPlay, CalendarCheck
} from 'lucide-react';
import { useMotionValue, useTransform } from 'framer-motion';
import { supabaseService } from '../services/supabaseService';
import { QuestType, QuestStatus, User, QuestVisibilityScope, QuestTimingIntent } from '../types';
import { QUEST_VIBE_PRESETS } from '../constants';
import { useToast } from './Toast';
import MapPicker from './MapPicker';
import SmartMap from './ui/SmartMap';
import { AestheticDayPicker, AestheticTimeGrid } from './ui/AestheticDateTimePicker';
import { MissionTimeline } from './ui/AestheticComponents';

interface CreateQuestScreenProps {
    onClose: () => void;
    onQuestCreated?: (id: string, title: string) => void;
    currentUser: User;
}

const formatTime12to24 = (time12: string) => {
    // "1:00 PM" -> "13:00"
    if (!time12.includes(' ')) return time12; // Already 24h or invalid
    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    let h = parseInt(hours, 10);
    if (h === 12) h = 0;
    if (modifier === 'PM') h += 12;
    return `${h.toString().padStart(2, '0')}:${minutes}`;
};

const formatTime24to12 = (time24: string) => {
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
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

    const maxDrag = Math.max(containerWidth - 60, 100);
    const progress = useTransform(x, [0, maxDrag], [0, 1]);
    const textOpacity = useTransform(x, [0, maxDrag * 0.3], [1, 0]);

    const handleDragEnd = () => {
        if (x.get() > maxDrag * 0.85) onLaunch();
        else x.set(0);
    };

    return (
        <div ref={containerRef} className="w-full h-14 rounded-full bg-black/40 border border-electric-teal/30 relative flex items-center px-1 overflow-hidden backdrop-blur-3xl group shadow-[0_0_20px_rgba(45,212,191,0.1)]">
            <motion.div
                style={{
                    opacity: useTransform(x, [0, maxDrag], [0.2, 0.8]),
                    width: x,
                    background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.5))'
                }}
                className="absolute inset-y-0 left-0 pointer-events-none rounded-l-full"
            />
            <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-electric-teal uppercase tracking-[0.4em] ml-12 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]">
                        {loading ? 'LAUNCHING...' : 'SLIDE TO DEPLOY'}
                    </span>
                    {!loading && (
                        <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                            <ArrowRight size={12} className="text-electric-teal/50" />
                        </motion.div>
                    )}
                </div>
            </motion.div>
            <motion.div
                drag={loading ? false : "x"}
                dragConstraints={{ left: 0, right: maxDrag }}
                dragElastic={0.05}
                style={{ x }}
                onDragEnd={handleDragEnd}
                className="w-12 h-12 rounded-full bg-electric-teal flex items-center justify-center text-black z-20 shadow-[0_0_15px_rgba(45,212,191,0.4)] cursor-grab active:cursor-grabbing border-2 border-white/20 relative"
            >
                {loading ? (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-6 h-6 border-2 border-black border-t-transparent rounded-full"
                    />
                ) : (
                    <Zap size={20} fill="black" strokeWidth={2.5} />
                )}
            </motion.div>
        </div>
    );
};

const CreateQuestScreen: React.FC<CreateQuestScreenProps> = ({ onClose, onQuestCreated, currentUser }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const totalSteps = 4;

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
    const [timingIntent, setTimingIntent] = useState<QuestTimingIntent>(QuestTimingIntent.SCHEDULED);
    const [duration, setDuration] = useState(2); // Hours for 'NOW' intent
    const [timeWindow, setTimeWindow] = useState(''); // e.g. 'Morning', 'Evening'
    const [flexibleDateTag, setFlexibleDateTag] = useState(''); // e.g. 'Today', 'This Weekend'
    const [locationDisplayName, setLocationDisplayName] = useState('');

    // New Fields
    const [vibeSignals, setVibeSignals] = useState<string[]>([]);
    const [itinerary, setItinerary] = useState<{ time: string, description: string }[]>([]);
    const [checklist, setChecklist] = useState<string[]>([]);

    // Temporary inputs
    const [itinTime, setItinTime] = useState('');
    const [itinDesc, setItinDesc] = useState('');
    const [checkItem, setCheckItem] = useState('');

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [showVibeDropdown, setShowVibeDropdown] = useState(false);
    const [customCategory, setCustomCategory] = useState('');
    const [customActivity, setCustomActivity] = useState('');
    const [customVibe, setCustomVibe] = useState('');

    const vibeDropdownRef = useRef<HTMLDivElement>(null);

    // Auto-adjust end time logic
    useEffect(() => {
        if (!startTime || !endTime) return;
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);

        const startMins = sh * 60 + sm;
        const endMins = eh * 60 + em;

        // If end time is earlier than start time (assuming same day), bump it
        // We allow "overnight" implying next day in handleLaunch, but for UI consistency let's ensure gap
        if (endMins <= startMins) {
            let newEnd = startMins + 120; // Default +2 hours
            if (newEnd >= 1440) newEnd = 1439; // Cap at 23:59 for single-day simplicity in UI

            const h = Math.floor(newEnd / 60);
            const m = newEnd % 60;
            setEndTime(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        }
    }, [startTime]);

    // Auto-scroll vibe dropdown
    useEffect(() => {
        if (showVibeDropdown && vibeDropdownRef.current) {
            vibeDropdownRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [showVibeDropdown]);

    const categories = [
        { name: 'Sports', icon: Trophy },
        { name: 'Social', icon: MessageSquare },
        { name: 'Adventure', icon: Compass },
        { name: 'Travel', icon: Plane },
        { name: 'Train', icon: Dumbbell },
        { name: 'Jobs', icon: Briefcase },
        { name: 'Others', icon: LayoutGrid }
    ];

    const activities: Record<string, string[]> = {
        Sports: ['Pickleball', 'Golf', 'Tennis', 'Padel', 'Badminton', 'Basketball', 'Volleyball', 'Football', 'Surfing', 'Skating', 'Table Tennis', 'Custom'],
        Social: ['House Party', 'Flea Market', 'Cafe', 'Study', 'Gallery Opening', 'Pop-up Shop', 'Vintage Hunting', 'Book Club', 'Pottery Class', 'Silent Disco', 'Custom'],
        Adventure: ['Hiking', 'Road Trip', 'Exploration', 'Camping', 'Rock Climbing', 'Surfing', 'Diving', 'Skydiving', 'Biking', 'Urban Exploration', 'Custom'],
        Travel: ['Sightseeing', 'Food Crawl', 'Resort', 'Backpacking', 'Photography', 'Museum Visit', 'Beach Day', 'Local Market', 'Souvenir Hunting', 'City Tour', 'Custom'],
        Train: ['Gym', 'Pilates', 'Yoga', 'Marathon Training', 'HIIT', 'CrossFit', 'Boxing', 'Cycling', 'Swim Training', 'Calisthenics', 'Custom'],
        Jobs: ['Commissions', 'Freelance', 'Networking', 'Co-working', 'Portfolio Review', 'Interview Prep', 'Skill Swap', 'Mentoring', 'Creative Collab', 'Custom'],
        Others: ['Custom']
    };

    const handleLaunch = async () => {
        const finalCategory = category === 'Others' ? customCategory : category;
        const finalActivity = activity === 'Custom' ? customActivity : activity;

        const isNowIntent = timingIntent === QuestTimingIntent.NOW;
        // Not enforcing Itinerary for now as per request

        // Enhanced Validation
        if (!title.trim()) { showToast("Missing Title!", "info"); return; }
        if (!locationName.trim()) { showToast("Missing Location!", "info"); return; }
        if (!finalCategory) { showToast("Select a Category!", "info"); return; }
        if (!finalActivity) { showToast("Select an Activity!", "info"); return; }

        // Ensure coords exist (fallback to mock if manual entry without map)
        const finalCoords = locationCoords || { latitude: 14.5995, longitude: 120.9842, place_name: locationName };

        setLoading(true);
        try {
            let startDateTime: Date;
            let endDateTime: Date;

            if (timingIntent === QuestTimingIntent.NOW) {
                startDateTime = new Date();
                endDateTime = new Date();
                endDateTime.setHours(startDateTime.getHours() + duration);
            } else if (timingIntent === QuestTimingIntent.FLEXIBLE) {
                // Resolve Flexible Date Tag to a real date for sorting/indexing
                let baseDate = new Date();
                if (flexibleDateTag === 'Tomorrow') baseDate.setDate(baseDate.getDate() + 1);
                else if (flexibleDateTag === 'This Weekend') {
                    const day = baseDate.getDay();
                    const diff = 6 - day + (day === 0 ? -6 : 1); // Next Saturday (or today if Sat) - simplistic
                    baseDate.setDate(baseDate.getDate() + (diff > 0 ? diff : 0));
                }
                else if (flexibleDateTag === 'Next Week') {
                    const day = baseDate.getDay();
                    const diff = 8 - day; // Next Monday
                    baseDate.setDate(baseDate.getDate() + diff);
                }

                const dateStr = baseDate.toISOString().split('T')[0];
                const windowTimes: Record<string, { start: string, end: string }> = {
                    'Morning': { start: '08:00', end: '12:00' },
                    'Afternoon': { start: '13:00', end: '17:00' },
                    'Evening': { start: '18:00', end: '22:00' },
                    'Night': { start: '23:00', end: '03:00' }
                };
                const times = windowTimes[timeWindow] || { start: '09:00', end: '21:00' };
                startDateTime = new Date(`${dateStr}T${times.start}`);
                endDateTime = new Date(`${dateStr}T${times.end}`);
                if (timeWindow === 'Night') endDateTime.setDate(endDateTime.getDate() + 1);
            } else {
                // Use local date components to avoid UTC offset issues
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                const sTime = startTime || '00:00';
                const eTime = endTime || '23:59';
                startDateTime = new Date(`${dateStr}T${sTime}`);
                endDateTime = new Date(`${dateStr}T${eTime}`);
            }

            const questData = {
                title,
                category: finalCategory,
                activity: finalActivity,
                description,
                type: isNowIntent ? QuestType.SPONTY : QuestType.CANON,
                timing_intent: timingIntent,
                is_public: visibility === QuestVisibilityScope.PUBLIC,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),

                // Align with types.ts Quest interface
                location: {
                    lat: finalCoords.latitude,
                    lng: finalCoords.longitude,
                    place_name: locationName,
                    address_full: locationName
                },
                location_name: locationName, // Legacy string
                location_coords: { latitude: finalCoords.latitude, longitude: finalCoords.longitude }, // Legacy coords

                max_participants: capacity,
                requires_approval: requiresApproval,
                host_id: currentUser.id,
                status: QuestStatus.DISCOVERABLE,
                aura_reward: 100,
                exp_reward: 120,

                // Exclude fields not in schema yet to prevent errors
                // vibe_signals: vibeSignals,
                // itinerary: itinerary,
                // checklist: checklist
            };

            const response = await supabaseService.quests.createQuest(questData);
            if (response.success) {
                showToast("Quest Deployed! 🚀", "success");
                onQuestCreated?.(response.questId!, title);
                onClose();
            } else {
                console.error("Quest creation error:", response.error);
                showToast(response.error || "Deployment failed.", "error");
            }
        } catch (e) {
            console.error(e);
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
                className="relative w-full max-w-sm bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-3xl min-h-[380px] max-h-[70vh] h-auto"
            >
                {/* Header */}
                <div className="px-4 pt-4 pb-2 flex justify-between items-center bg-gradient-to-b from-white/[0.02] to-transparent shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={step === 1 ? onClose : () => setStep(step - 1)} className="p-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all">
                            <ChevronLeft size={18} />
                        </button>
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-tighter text-white">Create a Quest</h2>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Stage {step} of {totalSteps}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-2">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Title</label>
                                        <span className="text-[7px] font-bold text-primary uppercase tracking-widest opacity-50">Required</span>
                                    </div>
                                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quest Title..." className="w-full bg-transparent text-2xl font-black uppercase text-white placeholder-white/10 outline-none border-b border-white/5 pb-2 focus:border-primary/50 transition-all" autoFocus />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Quest Type</label>
                                        <span className="text-[7px] font-bold text-primary uppercase tracking-widest opacity-50">Required</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => showToast("Sponty Quests coming soon!", "info")}
                                            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border bg-white/[0.02] border-white/5 text-gray-700 cursor-not-allowed opacity-50 relative group"
                                        >
                                            {/* <div className="absolute top-1 right-1"><ShieldCheck size={10} /></div> */}
                                            <Zap size={16} fill="none" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Coming Soon</span>
                                        </button>
                                        <button
                                            onClick={() => setTimingIntent(QuestTimingIntent.SCHEDULED)}
                                            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all ${timingIntent === QuestTimingIntent.SCHEDULED ? 'bg-white/10 border-white/30 text-white shadow-xl' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
                                        >
                                            <Calendar size={16} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Canon</span>
                                        </button>
                                        <button
                                            onClick={() => setTimingIntent(QuestTimingIntent.FLEXIBLE)}
                                            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all ${timingIntent === QuestTimingIntent.FLEXIBLE ? 'bg-electric-teal/20 border-electric-teal text-electric-teal shadow-[0_0_15px_rgba(45,212,191,0.2)]' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
                                        >
                                            <Compass size={16} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Flexible</span>
                                        </button>
                                    </div>
                                </div>

                                {timingIntent === QuestTimingIntent.NOW && (
                                    <div className="space-y-3 p-3 rounded-2xl bg-white/5 border border-white/5 animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Duration</label>
                                            <span className="text-xl font-black text-primary">{duration}H</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="12"
                                            value={duration}
                                            onChange={(e) => setDuration(parseInt(e.target.value))}
                                            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase">
                                            <span>1H</span>
                                            <span>6H</span>
                                            <span>12H</span>
                                        </div>
                                    </div>
                                )}

                                {timingIntent === QuestTimingIntent.SCHEDULED && (
                                    <div className="space-y-4 pt-2 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Date & Time</label>
                                            <span className="text-[7px] font-bold text-gray-600 uppercase tracking-widest opacity-50">Logistics</span>
                                        </div>

                                        {/* Redesigned Date Picker (Pill Slider + Calendar Icon) */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 flex items-center justify-between bg-white/5 border border-white/10 rounded-full p-1 pl-2 relative overflow-hidden group">
                                                <button
                                                    onClick={() => {
                                                        const d = new Date(selectedDate);
                                                        d.setDate(d.getDate() - 1);
                                                        setSelectedDate(d);
                                                    }}
                                                    className="p-3 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-90 z-10"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>

                                                <div className="flex flex-col items-center z-10 pointer-events-none">
                                                    <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
                                                        {selectedDate.toDateString() === new Date().toDateString() ? 'TODAY' : selectedDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                                                    </span>
                                                    <span className="text-xs font-black text-white uppercase tracking-widest">
                                                        {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        const d = new Date(selectedDate);
                                                        d.setDate(d.getDate() + 1);
                                                        setSelectedDate(d);
                                                    }}
                                                    className="p-3 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-90 z-10"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>

                                                {/* Subtle Background Glow */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                            </div>

                                            <button
                                                onClick={() => setShowDatePicker(true)}
                                                className="p-4 rounded-3xl bg-white/5 border border-white/10 text-gray-400 hover:text-primary hover:bg-white/10 transition-all active:scale-90"
                                            >
                                                <Calendar size={20} />
                                            </button>
                                        </div>

                                        {/* Grid Style Time Inputs (Reverted) */}
                                        <div className="flex items-center gap-3 pt-2">
                                            <div className="flex-1 space-y-1.5">
                                                <div className="flex justify-between">
                                                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1">Start</label>
                                                    <span className="text-[7px] font-bold text-gray-700 uppercase tracking-widest">Optional</span>
                                                </div>
                                                <button
                                                    onClick={() => setShowStartTimePicker(true)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-bold outline-none hover:bg-white/10 transition-all text-center tracking-widest focus:border-primary/50"
                                                >
                                                    {startTime ? formatTime24to12(startTime) : <span className="text-gray-600 text-[10px] uppercase">-- : --</span>}
                                                </button>
                                            </div>

                                            <div className="text-gray-700 pt-6"><ArrowRight size={12} /></div>

                                            <div className="flex-1 space-y-1.5">
                                                <div className="flex justify-between">
                                                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1">End</label>
                                                    <span className="text-[7px] font-bold text-gray-700 uppercase tracking-widest">Optional</span>
                                                </div>
                                                <button
                                                    onClick={() => setShowEndTimePicker(true)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-bold outline-none hover:bg-white/10 transition-all text-center tracking-widest focus:border-primary/50"
                                                >
                                                    {endTime ? formatTime24to12(endTime) : <span className="text-gray-600 text-[10px] uppercase">-- : --</span>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {timingIntent === QuestTimingIntent.FLEXIBLE && (
                                    <div className="space-y-4 pt-2 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                                        {/* Fuzzy Date Tabs */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Flexible Date</label>
                                                <span className="text-[7px] font-bold text-electric-teal uppercase tracking-widest opacity-50">Vague OK</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Today', 'Tomorrow', 'This Weekend', 'Next Week'].map(tag => (
                                                    <button
                                                        key={tag}
                                                        onClick={() => setFlexibleDateTag(tag)}
                                                        className={`py-2 px-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${flexibleDateTag === tag ? 'bg-electric-teal/20 border-electric-teal text-electric-teal' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
                                                    >
                                                        {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Vibe Window */}
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest px-1">Vibe Window</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Morning', 'Afternoon', 'Evening', 'Night'].map(win => (
                                                    <button
                                                        key={win}
                                                        onClick={() => setTimeWindow(win)}
                                                        className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${timeWindow === win ? 'bg-electric-teal/20 border-electric-teal text-electric-teal' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
                                                    >
                                                        {win}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Category</label>
                                        <span className="text-[7px] font-bold text-primary uppercase tracking-widest opacity-50">Required</span>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                                        {categories.map(cat => (
                                            <button key={cat.name} onClick={() => { setCategory(cat.name); setActivity(''); }} className={`flex-none w-12 h-14 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${category === cat.name ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}>
                                                <cat.icon size={16} />
                                                <span className="text-[7px] font-black uppercase tracking-widest">{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {category === 'Others' && (
                                    <div className="space-y-2 animate-in slide-in-from-left-2 duration-300">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Custom Category</label>
                                            <span className="text-[7px] font-bold text-primary uppercase tracking-widest opacity-50">Required</span>
                                        </div>
                                        <input value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="Enter Category Name..." className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary/50" />
                                    </div>
                                )}
                                {category && (
                                    <div className="space-y-2 animate-in fade-in">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Activity</label>
                                            <span className="text-[7px] font-bold text-primary uppercase tracking-widest opacity-50">Required</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 text-white">
                                            {activities[category].map(act => (
                                                <button key={act} onClick={() => setActivity(act)} className={`px-2 py-1 rounded-lg border text-[7px] font-black uppercase tracking-widest transition-all ${activity === act ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/10'}`}>{act}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {activity === 'Custom' && (
                                    <div className="space-y-2 animate-in slide-in-from-left-2 duration-300">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Custom Activity</label>
                                            <span className="text-[7px] font-bold text-primary uppercase tracking-widest opacity-50">Required</span>
                                        </div>
                                        <input value={customActivity} onChange={(e) => setCustomActivity(e.target.value)} placeholder="Enter Activity Name..." className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary/50" />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">The Plan</label>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[7px] font-bold uppercase transition-colors ${description.length >= 100 ? 'text-red-500' : 'text-gray-500'}`}>{description.length}/100</span>
                                            <span className="text-[7px] font-bold text-primary uppercase tracking-widest opacity-50">Required</span>
                                        </div>
                                    </div>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value.slice(0, 100))}
                                        placeholder="What's the plan?..."
                                        className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-gray-300 min-h-[60px] outline-none focus:border-white/10 resize-none"
                                    />
                                </div>
                                <div className="space-y-2 relative">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Vibe & Signals</label>
                                            <span className="text-[7px] font-bold text-gray-700 uppercase tracking-widest">(Optional)</span>
                                        </div>
                                        <button onClick={() => setShowVibeDropdown(!showVibeDropdown)} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 text-[8px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-widest">
                                            {vibeSignals.length > 0 ? `${vibeSignals.length} Selected` : 'None'}
                                            <ChevronDown size={10} className={`transition-transform duration-300 ${showVibeDropdown ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>

                                    {showVibeDropdown && (
                                        <div ref={vibeDropdownRef} className="absolute top-full left-0 right-0 z-50 mt-2 p-3 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                                            <div className="flex gap-2 mb-3">
                                                <input value={customVibe} onChange={e => setCustomVibe(e.target.value)} placeholder="Custom Vibe..." className="flex-1 bg-white/5 border border-white/5 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none focus:border-primary/50" />
                                                <button onClick={() => { if (customVibe) { setVibeSignals([...vibeSignals, customVibe]); setCustomVibe(''); } }} className="p-1.5 bg-primary text-black rounded-lg"><Plus size={14} /></button>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
                                                {QUEST_VIBE_PRESETS.map((vib) => {
                                                    const isSelected = vibeSignals.includes(vib);
                                                    return (
                                                        <button
                                                            key={vib}
                                                            onClick={() => setVibeSignals(prev => isSelected ? prev.filter(v => v !== vib) : [...prev, vib])}
                                                            className={`px-2 py-1 rounded-lg border text-[7px] font-black uppercase tracking-wider transition-all ${isSelected ? 'bg-primary text-black border-primary' : 'bg-white/5 border-white/5 text-gray-400'}`}
                                                        >
                                                            {vib}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Location</label>
                                        <span className="text-[7px] font-bold text-primary uppercase tracking-widest opacity-50">Required</span>
                                    </div>

                                    {/* Manual Location Input & Presets */}
                                    <div className="space-y-4">
                                        <input
                                            value={locationName}
                                            onChange={(e) => {
                                                setLocationName(e.target.value);
                                                // Mock coords for valid submission
                                                if (!locationCoords) setLocationCoords({ latitude: 14.5995, longitude: 120.9842 });
                                            }}
                                            placeholder="Enter location (e.g. Starbucks, Central Park)..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50 placeholder:text-gray-600 font-medium"
                                            autoFocus
                                        />
                                        <p className="text-[7px] text-electric-teal/60 font-bold uppercase tracking-widest mt-2 ml-1 animate-pulse">
                                            * Manual Entry Mode. Interactive Maps integrating soon...
                                        </p>

                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest px-1">Quick Select City</label>
                                            <div className="flex gap-2">
                                                {['Manila', 'Cebu', 'Davao'].map(city => (
                                                    <button
                                                        key={city}
                                                        onClick={() => {
                                                            setLocationName(prev => prev ? `${prev}, ${city}` : city);
                                                            setLocationCoords({ latitude: 14.5995, longitude: 120.9842 }); // Mock coords
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-[9px] font-black uppercase text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                                                    >
                                                        {city}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Map Hidden for now as requested */}
                                    {/* <div className="h-64 rounded-3xl bg-white/5 border border-white/5 relative overflow-hidden shadow-lg">
                                        <SmartMap ... />
                                    </div> */}
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                                {timingIntent !== QuestTimingIntent.NOW && (
                                    <>
                                        <div className="space-y-2 animate-in fade-in duration-500">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Itinerary</label>
                                                <span className="text-[7px] font-bold text-gray-500 uppercase tracking-widest opacity-50">Optional</span>
                                            </div>
                                            <div className="space-y-2">
                                                {itinerary.map((it, idx) => (
                                                    <div key={idx} className="flex gap-2 items-center bg-white/5 p-2 rounded-xl">
                                                        <span className="text-[10px] font-bold text-primary">{it.time}</span>
                                                        <span className="text-[10px] text-gray-300 flex-1 truncate">{it.description}</span>
                                                        <button onClick={() => setItinerary(prev => prev.filter((_, i) => i !== idx))} className="text-gray-500 hover:text-red-500"><X size={12} /></button>
                                                    </div>
                                                ))}
                                                <div className="flex gap-2">
                                                    <input value={itinTime} onChange={e => setItinTime(e.target.value)} placeholder="00:00" className="w-16 bg-white/5 border border-white/5 rounded-xl px-2 py-2 text-xs text-center text-white outline-none focus:border-primary/50" />
                                                    <input
                                                        value={itinDesc}
                                                        onChange={e => setItinDesc(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && itinTime && itinDesc) {
                                                                setItinerary([...itinerary, { time: itinTime, description: itinDesc }]);
                                                                setItinTime('');
                                                                setItinDesc('');
                                                            }
                                                        }}
                                                        placeholder="Activity..."
                                                        className="flex-1 bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary/50"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            if (itinTime && itinDesc) {
                                                                setItinerary([...itinerary, { time: itinTime, description: itinDesc }]);
                                                                setItinTime('');
                                                                setItinDesc('');
                                                            }
                                                        }}
                                                        className="bg-primary text-black p-2 rounded-xl"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 animate-in fade-in duration-500 delay-75">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Essentials</label>
                                                <span className="text-[7px] font-bold text-gray-500 uppercase tracking-widest opacity-50">Optional</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {checklist.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-1.5 bg-white/10 px-2 py-1.5 rounded-lg border border-white/5">
                                                        <span className="text-[9px] font-bold text-white">{item}</span>
                                                        <button onClick={() => setChecklist(prev => prev.filter((_, i) => i !== idx))} className="text-gray-500 hover:text-red-500"><X size={10} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    value={checkItem}
                                                    onChange={e => setCheckItem(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && checkItem) {
                                                            setChecklist([...checklist, checkItem]);
                                                            setCheckItem('');
                                                        }
                                                    }}
                                                    placeholder="Add item (e.g. Towel, ID)"
                                                    className="flex-1 bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary/50"
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (checkItem) { setChecklist([...checklist, checkItem]); setCheckItem(''); }
                                                    }}
                                                    className="bg-white/10 text-white p-2 rounded-xl hover:bg-white/20"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-3">

                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-white text-xs font-black uppercase tracking-widest">Approval Hub</p>
                                            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-0.5">Manually review joiners</p>
                                        </div>
                                        <button onClick={() => setRequiresApproval(!requiresApproval)} className={`w-10 h-6 rounded-full transition-all relative ${requiresApproval ? 'bg-primary' : 'bg-white/10'}`}>
                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-black rounded-full transition-all ${requiresApproval ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                        <div>
                                            <p className="text-white text-xs font-black uppercase tracking-widest">Squad Size</p>
                                            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-0.5">Max participants</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-black/40 rounded-xl p-1 border border-white/5">
                                            <button onClick={() => setCapacity(Math.max(2, capacity - 1))} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg"><Minus size={14} /></button>
                                            <span className="text-white text-xs font-black w-6 text-center">{capacity}</span>
                                            <button onClick={() => setCapacity(Math.min(50, capacity + 1))} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg"><Plus size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="space-y-4 rounded-2xl bg-white/5 border border-white/5 p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-white font-black text-lg uppercase leading-tight">{title}</h3>
                                            <p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1">{category} • {activity}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-start gap-3">
                                            <MapPin size={14} className="text-gray-500 mt-0.5" />
                                            <div>
                                                <p className="text-white text-xs font-bold">{locationName}</p>
                                                <p className="text-gray-500 text-[8px] uppercase tracking-wider">Location</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <CalendarDays size={14} className="text-gray-500 mt-0.5" />
                                            <div>
                                                <p className="text-white text-xs font-bold">
                                                    {timingIntent === 'NOW' ? 'Happening Now' : selectedDate.toDateString()}
                                                </p>
                                                <p className="text-gray-500 text-[8px] uppercase tracking-wider">
                                                    {timingIntent === 'NOW' ? `${duration}H Duration` : `${startTime || 'TBD'} - ${endTime || 'TBD'}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <MessageSquare size={14} className="text-gray-500 mt-0.5" />
                                            <div>
                                                <p className="text-gray-300 text-xs italic">"{description}"</p>
                                                <p className="text-gray-500 text-[8px] uppercase tracking-wider mt-1">The Plan</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="flex justify-between text-[9px] font-black uppercase text-gray-500 tracking-widest mb-2 px-1">
                                        <span>Read to deploy?</span>
                                        <span>{capacity} Spots</span>
                                    </div>
                                    <SlideToLaunch onLaunch={handleLaunch} loading={loading} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Nav */}
                <div className="p-4 bg-gradient-to-t from-white/[0.02] to-transparent shrink-0">
                    {step < totalSteps && (
                        <button
                            onClick={() => {
                                if (step === 1) {
                                    const finalCategory = category === 'Others' ? customCategory : category;
                                    const finalActivity = activity === 'Custom' ? customActivity : activity;
                                    if (!title || !finalCategory || !finalActivity) { showToast("Complete focus fields.", "info"); return; }
                                    if (timingIntent === QuestTimingIntent.FLEXIBLE && !selectedDate) { showToast("Pick a date.", "info"); return; }
                                }
                                if (step === 2) {
                                    // Validate Location Name
                                    if (!locationName) { showToast("Enter a location.", "info"); return; }
                                    if (timingIntent === QuestTimingIntent.FLEXIBLE && !timeWindow) { showToast("Select a time window.", "info"); return; }
                                }
                                if (step === 3) {
                                    // Optional checks for Itinerary 
                                }
                                setStep(step + 1);
                            }}
                            className="w-full py-3 rounded-xl bg-white text-black font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-xl text-[10px]"
                        >
                            {step === 3 ? 'Final Review' : 'Next Stage'} <ArrowRight size={18} />
                        </button>
                    )}
                </div>

                {/* Modals */}
                <AnimatePresence>
                    {showDatePicker && <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/95 p-6"><AestheticDayPicker value={selectedDate} onChange={setSelectedDate} onClose={() => setShowDatePicker(false)} /></div>}
                    {showStartTimePicker && <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/95 p-6"><AestheticTimeGrid value={startTime} onChange={(ex) => setStartTime(formatTime12to24(ex))} onClose={() => setShowStartTimePicker(false)} /></div>}
                    {showEndTimePicker && <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/95 p-6"><AestheticTimeGrid value={endTime} onChange={(ex) => setEndTime(formatTime12to24(ex))} onClose={() => setShowEndTimePicker(false)} /></div>}
                    {showMapPicker && <div className="absolute inset-0 z-[60] bg-black"><MapPicker onSelect={(loc, addr) => { setLocationCoords(loc); setLocationName(addr); setShowMapPicker(false); }} onClose={() => setShowMapPicker(false)} /></div>}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default CreateQuestScreen;
