import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Calendar, MapPin, Zap, ArrowRight, ChevronLeft, CalendarDays,
    ChevronRight, MessageSquare, Compass, Plus, Minus, ShieldCheck, Trophy, Clock,
    Briefcase, Dumbbell, LayoutGrid, Plane, ChevronDown,
    Globe, Signal, Users
} from 'lucide-react';
import { useMotionValue, useTransform } from 'framer-motion';
import { supabaseService } from '../services/supabaseService';
import { QuestType, QuestStatus, User, QuestVisibilityScope, QuestTimingIntent } from '../types';
import { QUEST_VIBE_PRESETS } from '../constants';
import { useToast } from './Toast';
import { AestheticDayPicker, AestheticTimeGrid } from './ui/AestheticDateTimePicker';
import { Sheet } from './ui/Sheet';
import InvitationPreview from './Quest/shared/InvitationPreview';

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
    if (!time24) return "";
    const [h] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}${ampm}`;
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
        <div ref={containerRef} className="w-full h-12 rounded-full bg-white/[0.02] border border-white/10 relative flex items-center px-1 overflow-hidden backdrop-blur-xl group shadow-[0_0_20px_rgba(255,140,0,0.1)] transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(255,140,0,0.2)]">
            <motion.div
                style={{
                    opacity: useTransform(x, [0, maxDrag], [0.1, 0.4]),
                    width: x,
                    background: 'linear-gradient(90deg, transparent, rgba(255,140,0,0.8))'
                }}
                className="absolute inset-y-0 left-0 pointer-events-none rounded-l-full blur-md"
            />
            <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-[#F5E6D3]/90 uppercase tracking-[0.3em] ml-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                        {loading ? 'SENDING…' : 'SLIDE TO SEND INVITATION'}
                    </span>
                    {!loading && (
                        <motion.div animate={{ x: [0, 5, 0], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                            <ArrowRight size={14} className="text-primary drop-shadow-[0_0_5px_rgba(255,140,0,0.8)]" />
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
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#E34234] flex items-center justify-center text-black z-20 shadow-[0_0_20px_rgba(255,140,0,0.5)] cursor-grab active:cursor-grabbing border border-white/30 relative overflow-hidden group-hover:scale-105 transition-transform"
            >
                {loading ? (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-6 h-6 border-2 border-black/80 border-t-transparent rounded-full"
                    />
                ) : (
                    <Zap size={22} fill="black" strokeWidth={2} className="relative z-10" />
                )}
                {/* Gloss effect on knob */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full pointer-events-none" />
            </motion.div>
        </div >
    );
};

const CreateQuestScreen: React.FC<CreateQuestScreenProps> = ({ onClose, onQuestCreated, currentUser }) => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const totalSteps = 4;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [activity, setActivity] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [locationName, setLocationName] = useState('');
    const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [capacity, setCapacity] = useState(10);
    // Approval is always required — every quest needs host review

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
    const [showVibeDropdown, setShowVibeDropdown] = useState(false);
    const [showItinTimePicker, setShowItinTimePicker] = useState(false);
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
        { name: 'Socials', icon: MessageSquare },
        { name: 'Adventures', icon: Compass },
        { name: 'Travel', icon: Plane },
        { name: 'Train', icon: Dumbbell },
        { name: 'Jobs', icon: Briefcase },
        { name: 'Others', icon: LayoutGrid }
    ];

    const activities: Record<string, string[]> = {
        Sports: ['Pickleball', 'Golf', 'Tennis', 'Padel', 'Badminton', 'Basketball', 'Volleyball', 'Football', 'Surfing', 'Skating', 'Table Tennis', 'Custom'],
        Socials: ['House Party', 'Flea Market', 'Cafe', 'Study', 'Gallery Opening', 'Pop-up Shop', 'Vintage Hunting', 'Book Club', 'Pottery Class', 'Silent Disco', 'Custom'],
        Adventures: ['Hiking', 'Road Trip', 'Exploration', 'Camping', 'Rock Climbing', 'Surfing', 'Diving', 'Skydiving', 'Biking', 'Urban Exploration', 'Custom'],
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
        // if (!locationName.trim()) { showToast("Missing Location!", "info"); return; }
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
                // Default to 23:59 (11:59 PM) for "TBD" time state.
                // This keeps the quest technically in the future all day so it won't auto-remove
                // from the feed, but we will catch 23:59 in the UI and render "TBD" instead.
                const sTime = startTime || '23:59';
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
                requires_approval: true, // Always require host approval
                visibility_scope: visibility,
                host_id: currentUser.id,
                status: QuestStatus.DISCOVERABLE,
                // aura_reward: 100,
                // exp_reward: 120,

                // v1.3 Enhanced Details
                vibe_signals: vibeSignals,
                itinerary: itinerary,
                checklist: checklist
            };

            const response = await supabaseService.quests.createQuest(questData);
            if (response.success) {
                showToast("Quest Posted", "success", {
                    icon: <Compass size={14} />,
                    action: {
                        label: "View Post Details",
                        onClick: () => {
                            if (response.questId) {
                                navigate(`/app/quest/${response.questId}`);
                            }
                        }
                    }
                });
                onQuestCreated?.(response.questId!, title);
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

    const stageLabels = ['The Call', 'Where', 'The Guestlist', 'Send it'];

    return (
        <Sheet
            open={true}
            onClose={onClose}
            variant="auto"
            size="lg"
            showClose
            title="Compose invitation"
            subtitle={`Stage ${step} of ${totalSteps} · ${stageLabels[step - 1]}`}
            dismissible={!loading}
            bodyClassName="px-5 py-4"
            headerAccessory={
                step > 1 ? (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="p-2 rounded-full bg-white/5 border border-white/10 text-[#8B7E6D] hover:text-[#F5E6D3] transition-all active:scale-95"
                        aria-label="Back"
                    >
                        <ChevronLeft size={16} />
                    </button>
                ) : undefined
            }
            footer={
                <div>
                    {step < totalSteps ? (
                        <button
                            onClick={() => {
                                if (step === 1) {
                                    const finalCategory = category === 'Others' ? customCategory : category;
                                    const finalActivity = activity === 'Custom' ? customActivity : activity;
                                    if (!title.trim()) { showToast('Give your invitation a title.', 'info'); return; }
                                    if (!finalCategory) { showToast('Pick a category.', 'info'); return; }
                                    if (!finalActivity) { showToast('Pick an activity.', 'info'); return; }
                                    if (timingIntent === QuestTimingIntent.FLEXIBLE) {
                                        if (!flexibleDateTag) { showToast('Pick a timeframe.', 'info'); return; }
                                        if (!timeWindow) { showToast('Pick a vibe window.', 'info'); return; }
                                    }
                                }
                                if (step === 2) {
                                    if (!locationName.trim()) setLocationName('TBD');
                                }
                                setStep(step + 1);
                            }}
                            className="w-full py-4 rounded-full bg-white text-[#080707] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {step === 3 ? 'Review invitation' : 'Continue'} <ArrowRight size={14} />
                        </button>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-3">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] px-1">
                                <div className="flex items-center gap-1.5">
                                    {visibility === QuestVisibilityScope.PUBLIC ? <Globe size={10} className="text-[#FFB854]" /> :
                                        visibility === QuestVisibilityScope.FOLLOWERS ? <Signal size={10} className="text-[#FFB854]" /> : <Users size={10} className="text-[#FFB854]" />}
                                    <span className="text-[#F5E6D3]">{visibility}</span>
                                    <span className="text-[#8B7E6D] mx-1">·</span>
                                    <span className="text-[#8B7E6D]">{capacity} spots</span>
                                </div>
                                <span className="text-[#8B7E6D]">{timingIntent === QuestTimingIntent.NOW ? 'SPONTY' : timingIntent === QuestTimingIntent.SCHEDULED ? 'CANON' : 'FLEX'}</span>
                            </div>
                            <SlideToLaunch onLaunch={handleLaunch} loading={loading} />
                        </div>
                    )}
                </div>
            }
        >
            <div className="relative">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Title</label>
                                        <span className="text-[7px] font-bold text-primary uppercase tracking-widest opacity-50">Required</span>
                                    </div>
                                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="QUEST TITLE" className="w-full bg-transparent text-3xl font-black uppercase text-white placeholder-white/20 outline-none border-b-2 border-white/10 pb-2 focus:border-primary/50 transition-all font-display tracking-tight" autoFocus />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Quest Type</label>
                                        <span className="text-[7px] font-bold text-primary uppercase tracking-widest opacity-50">Required</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="relative group">
                                            <button
                                                disabled
                                                className="w-full flex flex-col items-center justify-center gap-2 p-4 rounded-3xl border bg-white/[0.02] border-white/5 text-gray-500 opacity-40 grayscale cursor-not-allowed"
                                            >
                                                <Zap size={20} className="relative z-10" />
                                                <span className="text-[9px] font-black uppercase tracking-widest relative z-10">Sponty</span>
                                            </button>
                                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-black text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Coming Soon</div>
                                        </div>
                                        <button
                                            onClick={() => setTimingIntent(QuestTimingIntent.SCHEDULED)}
                                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${timingIntent === QuestTimingIntent.SCHEDULED ? 'bg-white/10 border-white/30 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-white/[0.02] border-white/5 text-gray-500 hover:bg-white/5 hover:border-white/10'}`}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity ${timingIntent === QuestTimingIntent.SCHEDULED ? 'opacity-100' : 'group-hover:opacity-50'}`} />
                                            <Calendar size={20} className="relative z-10" />
                                            <span className="text-[9px] font-black uppercase tracking-widest relative z-10">Canon</span>
                                        </button>
                                        <button
                                            onClick={() => setTimingIntent(QuestTimingIntent.FLEXIBLE)}
                                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${timingIntent === QuestTimingIntent.FLEXIBLE ? 'bg-primary/10 border-primary/50 text-primary shadow-[0_0_20px_rgba(255,140,0,0.2)]' : 'bg-white/[0.02] border-white/5 text-gray-500 hover:bg-white/5 hover:border-white/10'}`}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity ${timingIntent === QuestTimingIntent.FLEXIBLE ? 'opacity-100' : 'group-hover:opacity-50'}`} />
                                            <Compass size={20} className="relative z-10" />
                                            <span className="text-[9px] font-black uppercase tracking-widest relative z-10">Flex</span>
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
                                                    {startTime ? formatTime24to12(startTime) : <span className="text-gray-700/40 text-[10px] font-black uppercase tracking-widest italic">Select time</span>}
                                                </button>
                                            </div>

                                            <div className="text-gray-700 pt-6"><ArrowRight size={12} /></div>

                                            <div className="flex-1 space-y-1.5">
                                                <div className="flex justify-between">
                                                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1">End</label>
                                                    <span className="text-[7px] font-bold text-gray-700 uppercase tracking-widest">Optional</span>
                                                </div>
                                                <button
                                                    disabled={!startTime}
                                                    onClick={() => {
                                                        if (startTime) setShowEndTimePicker(true);
                                                        else showToast("Pick start time first", "info");
                                                    }}
                                                    className={`w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-bold outline-none transition-all text-center tracking-widest focus:border-primary/50 ${!startTime ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}`}
                                                >
                                                    {endTime ? formatTime24to12(endTime) : <span className="text-gray-700/40 text-[10px] font-black uppercase tracking-widest italic">{startTime ? 'Select time' : '...'}</span>}
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
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Today', 'Tomorrow', 'This Weekend', 'Next Week'].map(tag => (
                                                    <button
                                                        key={tag}
                                                        onClick={() => setFlexibleDateTag(tag)}
                                                        className={`py-2 px-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${flexibleDateTag === tag ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
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
                                                        className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${timeWindow === win ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
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
                                    <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-2 -mx-2 px-2">
                                        {categories.map(cat => (
                                            <button key={cat.name} onClick={() => { setCategory(cat.name); setActivity(''); }} className={`flex-none w-16 h-20 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${category === cat.name ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/10'}`}>
                                                <cat.icon size={20} strokeWidth={2} />
                                                <span className="text-[8px] font-black uppercase tracking-widest">{cat.name}</span>
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
                                        <div className="flex flex-wrap gap-2 text-white pb-2">
                                            {activities[category].map(act => (
                                                <button
                                                    key={act}
                                                    onClick={() => setActivity(act)}
                                                    className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${activity === act ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.3)] scale-105' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/10'}`}
                                                >
                                                    {act}
                                                </button>
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
                                        <input value={customActivity} onChange={(e) => setCustomActivity(e.target.value)} placeholder="ENTER ACTIVITY NAME..." className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-primary/50 focus:bg-white/[0.05] font-bold uppercase tracking-wide transition-all" />
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
                                        placeholder="WHAT'S THE PLAN?"
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-white/20 min-h-[80px] outline-none focus:border-white/20 focus:bg-white/[0.05] resize-none transition-all font-medium leading-relaxed"
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
                                        <div ref={vibeDropdownRef} className="absolute bottom-full left-0 right-0 z-50 mb-2 p-3 bg-[var(--bg-surface)] border border-[var(--border-tech)] rounded-2xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-200">
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
                                        <span className="text-[7px] font-bold text-gray-700 uppercase tracking-widest opacity-50">Optional</span>
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
                                            placeholder="ENTER LOCATION DEETS..."
                                            className="w-full bg-[var(--bg-glass)] border border-[var(--border-tech)] rounded-2xl px-4 py-4 text-sm text-[var(--text-primary)] outline-none focus:border-primary/50 focus:bg-white/[0.05] placeholder:text-white/20 font-bold tracking-wide transition-all"
                                            autoFocus
                                        />
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-3 ml-1">
                                            Interactive map coming soon. Enter location manually for now.
                                        </p>

                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest px-1">Quick Select City</label>
                                            <div className="flex gap-2">
                                                {['Manila', 'Cebu', 'Davao'].map(city => (
                                                    <button
                                                        key={city}
                                                        onClick={() => {
                                                            const suffix = `, ${city}`;
                                                            if (!locationName.includes(city)) {
                                                                setLocationName(prev => prev ? `${prev}${suffix}` : city);
                                                            }
                                                            setLocationCoords({ latitude: 14.5995, longitude: 120.9842 }); // Mock coords
                                                        }}
                                                        className={`px-4 py-2 rounded-xl border transition-all duration-300 active:scale-95 text-[10px] font-black uppercase tracking-widest ${locationName === city ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/10 hover:border-white/10'}`}
                                                    >
                                                        {city}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Map Hidden for now as requested */}
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
                                                    <div key={idx} className="flex gap-2 items-center bg-[var(--bg-glass)] border border-[var(--border-tech)] p-2 rounded-xl">
                                                        <span className="text-[10px] font-bold text-primary">{it.time}</span>
                                                        <span className="text-[10px] text-gray-300 flex-1 truncate">{it.description}</span>
                                                        <button onClick={() => setItinerary(prev => prev.filter((_, i) => i !== idx))} className="text-gray-500 hover:text-red-500"><X size={12} /></button>
                                                    </div>
                                                ))}
                                                <div className="flex gap-2 min-h-[40px]">
                                                    <div className="w-24 relative group">
                                                        <button
                                                            onClick={() => setShowItinTimePicker(true)}
                                                            className="w-full h-full bg-[var(--bg-glass)] border border-[var(--border-tech)] rounded-2xl px-2 text-[10px] font-black uppercase text-[var(--text-primary)] outline-none focus:border-primary/50 text-center cursor-pointer hover:bg-white/5 transition-all flex items-center justify-center gap-1"
                                                        >
                                                            {itinTime ? formatTime24to12(itinTime) : 'TIME'}
                                                            <ChevronDown size={10} className="text-gray-500" />
                                                        </button>
                                                    </div>
                                                    <input
                                                        value={itinDesc}
                                                        onChange={e => setItinDesc(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                if (itinDesc) {
                                                                    const finalTime = itinTime ? formatTime24to12(itinTime) : "TBD";
                                                                    setItinerary([...itinerary, { time: finalTime, description: itinDesc }]);
                                                                    setItinTime('');
                                                                    setItinDesc('');
                                                                }
                                                            }
                                                        }}
                                                        placeholder="ACTIVITY..."
                                                        className="flex-1 bg-[var(--bg-glass)] border border-[var(--border-tech)] rounded-2xl px-4 py-3 text-xs text-[var(--text-primary)] outline-none focus:border-primary/50 focus:bg-white/[0.05] font-bold uppercase tracking-wide transition-all"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (itinDesc) {
                                                                const finalTime = itinTime ? formatTime24to12(itinTime) : "TBD";
                                                                setItinerary([...itinerary, { time: finalTime, description: itinDesc }]);
                                                                setItinTime('');
                                                                setItinDesc('');
                                                            }
                                                        }}
                                                        className="bg-primary text-black p-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,140,0,0.3)]"
                                                    >
                                                        <Plus size={18} strokeWidth={3} />
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
                                                    placeholder="ADD ITEM (E.G. TOWEL, ID)..."
                                                    className="flex-1 bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-primary/50 focus:bg-white/[0.05] font-bold uppercase tracking-wide transition-all"
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (checkItem) { setChecklist([...checklist, checkItem]); setCheckItem(''); }
                                                    }}
                                                    className="bg-white/10 text-white p-3 rounded-2xl hover:bg-white/20 transition-all border border-white/5"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="p-3 rounded-2xl bg-[var(--bg-glass)] border border-[var(--border-tech)] space-y-4 shadow-xl">
                                    <div className="space-y-2">
                                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Mission Pulse (Visibility)</p>
                                        <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
                                            {[
                                                { id: QuestVisibilityScope.PUBLIC, label: 'Public', icon: Globe },
                                                { id: QuestVisibilityScope.FOLLOWERS, label: 'Followers', icon: Signal },
                                                { id: QuestVisibilityScope.FRIENDS, label: 'Friends', icon: Users }
                                            ].map((v) => (
                                                <button
                                                    key={v.id}
                                                    onClick={() => setVisibility(v.id as QuestVisibilityScope)}
                                                    className={`
                                                        flex flex-col items-center gap-1 py-2.5 rounded-lg transition-all border
                                                        ${visibility === v.id
                                                            ? 'bg-[var(--text-primary)] text-[var(--bg-card)] border-[var(--text-primary)] shadow-[0_0_15px_rgba(0,0,0,0.1)]'
                                                            : 'bg-transparent text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'}
                                                    `}
                                                >
                                                    <v.icon size={12} />
                                                    <span className="text-[7px] font-black uppercase tracking-widest">{v.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[var(--text-primary)] text-xs font-black uppercase tracking-widest">Squad Size</p>
                                                <p className="text-[8px] text-[var(--text-secondary)] font-bold uppercase tracking-[0.2em] mt-0.5">Max participants</p>
                                            </div>
                                            <div className="flex items-center gap-2 bg-[var(--bg-surface)] rounded-xl p-1.5 border border-[var(--border-tech)]">
                                                <button onClick={() => setCapacity(Math.max(2, capacity - 1))} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 rounded-lg transition-colors"><Minus size={14} /></button>
                                                <span className="text-[var(--text-primary)] text-sm font-black w-8 text-center">{capacity}</span>
                                                <button onClick={() => setCapacity(Math.min(50, capacity + 1))} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 rounded-lg transition-colors"><Plus size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                <div className="px-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFB854]">Send it</p>
                                    <p className="text-[11px] text-[#8B7E6D] font-medium mt-1 leading-relaxed">Here's how the squad will see your invitation.</p>
                                </div>
                                <InvitationPreview
                                    host={currentUser}
                                    title={title}
                                    description={description}
                                    category={category === 'Others' ? (customCategory || undefined) : (category || undefined)}
                                    whenLabel={
                                        timingIntent === QuestTimingIntent.NOW
                                            ? `Happening now · ${duration}h`
                                            : timingIntent === QuestTimingIntent.FLEXIBLE
                                            ? `${flexibleDateTag || 'Flexible'} · ${timeWindow || 'Open window'}`
                                            : `${selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}${
                                                  startTime ? ` @ ${formatTime24to12(startTime)}` : ' @ TBD'
                                              }`
                                    }
                                    whereLabel={locationName || undefined}
                                    vibeTags={vibeSignals}
                                    capacity={capacity}
                                    visibilityLabel={
                                        visibility === QuestVisibilityScope.PUBLIC
                                            ? 'Public'
                                            : visibility === QuestVisibilityScope.FOLLOWERS
                                            ? 'Followers'
                                            : 'Friends'
                                    }
                                />

                                {(itinerary.length > 0 || checklist.length > 0) && (
                                    <div className="rounded-[2rem] bg-white/[0.02] border border-white/5 p-5 space-y-4">
                                        {itinerary.length > 0 && (
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B7E6D] mb-2">The Plan</p>
                                                <div className="space-y-1.5">
                                                    {itinerary.slice(0, 4).map((it, i) => (
                                                        <div key={i} className="flex gap-2 items-center">
                                                            <span className="text-[9px] font-black text-[#FFB854] w-14 shrink-0">{it.time}</span>
                                                            <span className="text-[11px] text-[#F5E6D3]/80 truncate">{it.description}</span>
                                                        </div>
                                                    ))}
                                                    {itinerary.length > 4 && (
                                                        <p className="text-[9px] text-[#8B7E6D] italic ml-16">+ {itinerary.length - 4} more</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {checklist.length > 0 && (
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B7E6D] mb-2">Essentials</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {checklist.map((c, i) => (
                                                        <span key={i} className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/5 text-[10px] font-medium text-[#F5E6D3]/80">
                                                            {c}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Nested pickers */}
                <AnimatePresence>
                    {showDatePicker && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-6"><AestheticDayPicker value={selectedDate} onChange={setSelectedDate} onClose={() => setShowDatePicker(false)} /></div>}
                    {showStartTimePicker && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-6"><AestheticTimeGrid value={startTime} onChange={setStartTime} onClose={() => setShowStartTimePicker(false)} /></div>}
                    {showEndTimePicker && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-6"><AestheticTimeGrid value={endTime} onChange={setEndTime} onClose={() => setShowEndTimePicker(false)} minTime={startTime} /></div>}
                    {showItinTimePicker && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-6"><AestheticTimeGrid value={itinTime} onChange={setItinTime} onClose={() => setShowItinTimePicker(false)} /></div>}
                </AnimatePresence>
        </Sheet>
    );
};

export default CreateQuestScreen;
