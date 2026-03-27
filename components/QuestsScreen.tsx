import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, ChevronLeft, MapPin, Search, X, Compass, Plus, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

import { supabaseService } from '../services/supabaseService';
import { Quest, QuestType, QuestStatus, User, Competition } from '../types';
import { generateRandomQuests } from '../utils/questGenerator';
import QuestGeneratorUI from './Quest/QuestGeneratorUI';
import QuestCard from './QuestCard';
import QuestMap from './Quest/QuestMap';
import { EKGLoader } from './ui/AestheticComponents';
import { useToast } from './Toast';
import { useNavigation } from '../contexts/NavigationContext';
import { QuestSidebar, QuestHeader, MinimalCalendar } from './Quest/QuestFilters';
import QuestDropModal from './Quest/QuestDropModal';
import QuestDropCard from './Quest/QuestDropCard';

interface QuestsScreenProps {
    onOpenQuest: (q: Quest) => void;
    onOpenCompetition: (c: Competition) => void;
    onOpenMyQuests: () => void;
    onOpenProfile: () => void;
    currentUser: User | null; // Allow null for Guests
    onNavigate: (tab: 'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS') => void;
    onReset?: () => void;
    onOpenQuestList: () => void;
    onLaunchQuest?: () => void;
    refreshTrigger?: number;
    hasUserPostedToday: boolean;
    onTimerZero?: () => void;
}

const QuestsScreen: React.FC<QuestsScreenProps> = ({
    onOpenQuest,
    onOpenCompetition,
    onOpenMyQuests,
    onOpenProfile,
    currentUser,
    onNavigate,
    onReset,
    onOpenQuestList,
    onLaunchQuest,
    refreshTrigger = 0,
    hasUserPostedToday,
    onTimerZero
}) => {
    const { setTabs, setActiveTab: setGlobalActiveTab } = useNavigation();
    const [activeCat, setActiveCat] = useState('All');
    const [questMode, setQuestMode] = useState<'CANON' | 'SPONTY'>('CANON');
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showGenerator, setShowGenerator] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [activeDrop, setActiveDrop] = useState<any>(null);
    const [viewingLocation, setViewingLocation] = useState('Global');
    const [isMapFull, setIsMapFull] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [localRefresh, setLocalRefresh] = useState(0);
    const [questChats, setQuestChats] = useState<any[]>([]);
    const [chatsLoading, setChatsLoading] = useState(false);
    const lastScrollY = useRef(0);
    const lastTab = useRef(questMode);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const currentScrollY = e.currentTarget.scrollTop;
        lastScrollY.current = currentScrollY;
    };

    const MOCK_DROPS = [
        {
            id: 'drop-1',
            brand: 'Be4L Official',
            brand_logo: 'https://ui-avatars.com/api/?name=B4L&background=000&color=fff',
            title: 'Community Kickstart',
            description: 'Record a side quest clip and upload it to the Lore feed. Show us what "living" looks like to you.',
            reward: '₱1,000 PHP',
            hunters_count: 124,
            difficulty: 'EASY' as const
        },
        {
            id: 'drop-2',
            brand: 'UrbanX',
            brand_logo: 'https://ui-avatars.com/api/?name=UX&background=333&color=fff',
            title: 'School Pool Dare',
            description: 'Are you willing to jump into your school swimming pool with your full uniform on for a reward? Video proof required.',
            reward: '₱500 PHP',
            hunters_count: 12,
            difficulty: 'HARD' as const
        }
    ];

    const { showToast } = useToast();

    const navigate = useNavigate();

    const handleJoin = async (id: string) => {
        // GUEST CHECK: Navigate to /auth
        if (!currentUser) {
            navigate('/auth');
            return;
        }

        if (currentUser.is_operator) {
            showToast("Brand accounts cannot join quests.", "info");
            return;
        }

        if (id.startsWith('mock-') || id.startsWith('gen-')) {
            showToast("Joined! (Simulated)", 'success');
            onNavigate('CHATS');
            return;
        }

        const quest = quests.find(q => q.id === id);
        const success = await supabaseService.quests.requestToJoin(id, currentUser?.id, true);
        if (success) {
            showToast("Join Requested! Awaiting host approval. 📡", 'success');
        } else {
            showToast("Failed to send request", 'error');
        }
    };

    // Register Tabs
    useEffect(() => {
        // Force default tab to CANON when landing on Quests page
        setGlobalActiveTab('CANON');
        // Clear global tabs to hide the floating side pill
        setTabs([]);
        return () => setTabs([]);
    }, []);

    useEffect(() => {
        setActiveCat('All');
    }, [questMode]);

    // Optimized effect dependencies to prevent full-screen loader on subtle filter changes
    useEffect(() => {


        // Only trigger full loading state for major context switches (Tab change or initial load)
        const isTabSwitch = quests.length === 0 || lastTab.current !== questMode;
        if (isTabSwitch) setLoading(true);
        lastTab.current = questMode;

        const type = questMode === 'CANON' ? QuestType.CANON : QuestType.SPONTY;
        const randomQuests = generateRandomQuests(activeCat, selectedDate, 25, type);

        supabaseService.quests.getQuests(activeCat).then(existingQuests => {
            // ... (rest of the quest fetching logic)
            let featured: Quest[] = [];


            const allQuests = [...featured, ...existingQuests, ...randomQuests].filter(q => {
                const isDiscoverable = q.status === QuestStatus.DISCOVERABLE || !q.status;
                const qDate = new Date(q.start_time);

                // Rule 4: Remove if capacity is reached
                const currentParticipants = Array.isArray(q.participant_ids) ? q.participant_ids.length : 0;
                const maxCapacity = q.capacity || q.max_participants || 999;
                const isNotFull = currentParticipants < maxCapacity;

                // Rule 2 & TBD: Remove if start time elapsed, UNLESS it's a TBD quest (23:59)
                const now = new Date();
                const isTBD = qDate.getHours() === 23 && qDate.getMinutes() === 59;

                let isNotPast = false;
                if (isTBD) {
                    // For TBD, just check if the date hasn't passed (meaning it's today or future)
                    const today = new Date(now);
                    today.setHours(0, 0, 0, 0);
                    const questDay = new Date(qDate);
                    questDay.setHours(0, 0, 0, 0);
                    isNotPast = questDay >= today;
                } else {
                    // For specific times, strictly check if the timestamp hasn't passed
                    isNotPast = qDate > now;
                }

                return isDiscoverable && isNotFull && isNotPast;
            });

            // De-duplicate by ID, keeping featured first
            const uniqueQuests = allQuests.filter((q, index, self) =>
                index === self.findIndex((t) => t.id === q.id)
            );

            setQuests(uniqueQuests);
            setLoading(false);
        });
    }, [questMode, activeCat, selectedDate, refreshTrigger, localRefresh]);

    useEffect(() => {
        const { supabase } = supabaseService as any;
        if (!supabase) return;

        const channel = supabase.channel('quests-discovery')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'quests'
            }, () => {
                // Real-time update - trigger a local refresh
                setLocalRefresh(prev => prev + 1);
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, []);

    // Reset scroll to top when major filters change to prevent "falling" to footer
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [questMode, activeCat]);

    // Handle incoming quest from URL (Direct to quest card + Open Overlay)
    const [searchParams, setSearchParams] = useSearchParams();
    const incomingQuestId = searchParams.get('quest');
    const hasAutoScrolled = useRef<string | null>(null);

    useEffect(() => {
        if (incomingQuestId && quests.length > 0 && hasAutoScrolled.current !== incomingQuestId) {
            const targetQuest = quests.find(q => q.id === incomingQuestId);
            if (targetQuest) {
                hasAutoScrolled.current = incomingQuestId;

                // Auto-switch date and tab to ensure quest is visible in the filtered list
                if (targetQuest.start_time) {
                    setSelectedDate(new Date(targetQuest.start_time));
                }
                if (targetQuest.mode === QuestType.SPONTY) {
                    setQuestMode('SPONTY');
                } else {
                    setQuestMode('CANON');
                }

                // Direct to card visually (Scroll into view)
                setTimeout(() => {
                    const el = document.getElementById(`quest-${incomingQuestId}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 800);
            }
        }
    }, [incomingQuestId, quests]);

    // Reset scroll to top when major filters change to prevent "falling" to footer
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [questMode, activeCat]);

    const filteredQuests = useMemo(() => {
        return quests.filter(q => {
            // Mode filter
            if (q.mode !== QuestType.CANON) return false;

            // Category filter
            if (activeCat !== 'All' && q.category !== activeCat) return false;

            // Location filter
            if (viewingLocation !== 'Global') {
                const locStr = typeof q.location === 'string'
                    ? q.location
                    : `${q.location?.address_full || ''} ${q.location?.place_name || ''}`;

                const filter = viewingLocation.toLowerCase();
                if (!locStr.toLowerCase().includes(filter)) return false;
            }

            // Discovery filter: only show DISCOVERABLE quests
            const isDiscoverable = q.status === QuestStatus.DISCOVERABLE || !q.status;
            if (!isDiscoverable) return false;

            const now = new Date();
            const qDate = new Date(q.start_time);

            // Rule 4: Remove if capacity is reached
            const currentParticipants = Array.isArray(q.participant_ids) ? q.participant_ids.length : 0;
            const maxCapacity = q.capacity || q.max_participants || 999;
            if (currentParticipants >= maxCapacity) return false;

            // Rule 2 & TBD: Remove if start time elapsed, UNLESS it's a TBD quest (23:59)
            const isTBD = qDate.getHours() === 23 && qDate.getMinutes() === 59;
            if (!isTBD && qDate <= now) return false;

            // Date filter: show quests for the selected day (compare dates only, not time)
            const qDay = new Date(qDate);
            qDay.setHours(0, 0, 0, 0);
            const selDay = new Date(selectedDate);
            selDay.setHours(0, 0, 0, 0);

            return qDay.getTime() === selDay.getTime();
        });
    }, [quests, questMode, activeCat, viewingLocation, selectedDate]);

    return (
        <div className="flex-1 flex flex-col relative">




            <div
                // ref={containerRef}
                // onScroll={handleScroll}
                className="flex-1 flex flex-col md:flex-row max-w-[1600px] mx-auto w-full"
            >
                {/* Desktop Sidebar (Left) */}
                <div className="hidden md:flex flex-col w-40 shrink-0 border-r border-white/[0.04] sticky top-[88px] h-[calc(100vh-88px)]">
                    <QuestSidebar
                        selectedDate={selectedDate}
                        onDateChange={(d) => {
                            setSelectedDate(d);
                            // Avoid full screen loader for date/category changes to prevent "Seizure" effect
                        }}
                        onOpenCalendar={() => setShowCalendar(true)}
                        activeTab={questMode}
                        setActiveTab={setQuestMode}
                        activeCat={activeCat}
                        setActiveCat={setActiveCat}
                        viewingLocation={viewingLocation}
                        setViewingLocation={setViewingLocation}
                    />
                </div>

                {/* Main Feed Content (Right / Center) */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 pb-0 no-scrollbar relative"
                >
                    {/* Header Spacer for Floating Nav */}
                    <div className="h-[88px] w-full shrink-0" />

                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="z-[60] pb-2 pointer-events-none md:hidden"
                    >
                        <div className="pointer-events-auto pt-4 relative">
                            <QuestHeader
                                selectedDate={selectedDate}
                                onDateChange={(d) => {
                                    setSelectedDate(d);
                                    // No full-screen flicker for mobile date changes
                                }}
                                onOpenCalendar={() => setShowCalendar(true)}
                                activeCat={activeCat}
                                setActiveCat={setActiveCat}
                                activeTab={questMode}
                                setActiveTab={setQuestMode}
                                viewingLocation={viewingLocation}
                                setViewingLocation={setViewingLocation}
                            />
                        </div>
                    </motion.div>

                    {questMode === 'CANON' && (
                        <div className="px-4 md:px-8 pt-4 md:pt-8 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-20">
                                {loading ? (
                                    <div className="col-span-full py-20 flex justify-center">
                                        <EKGLoader size={60} />
                                    </div>
                                ) : filteredQuests.length > 0 ? (
                                    filteredQuests.map(q => (
                                        <QuestCard
                                            key={q.id}
                                            quest={q}
                                            currentUser={currentUser}
                                            onOpenDetail={onOpenQuest}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full py-32 flex flex-col items-center justify-center text-gray-600 border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02]">
                                        <Zap size={32} className="mb-4 opacity-50" />
                                        <p className="text-xs font-bold uppercase tracking-widest">No Quests Scheduled</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {questMode === 'SPONTY' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 space-y-12 min-h-[70vh] animate-in fade-in duration-700 max-w-6xl mx-auto w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-start">
                                {/* Left Side: Random Generator */}
                                <div className="flex flex-col gap-4">
                                    <QuestGeneratorUI
                                        onAccept={(q) => {
                                            handleJoin(q.id);
                                        }}
                                        onViewDetail={(q) => {
                                            onOpenQuest(q);
                                        }}
                                        showClose={false}
                                    />
                                </div>

                                {/* Right Side: Quest Drops */}
                                <div className="flex flex-col gap-4">
                                    <QuestDropCard
                                        drop={null} // Set to null to show 'Stay Tuned' state, or MOCK_DROPS[0] to show active
                                        onAccept={(drop) => {
                                            setActiveDrop(drop);
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Coming Soon Section */}
                            <div className="w-full max-w-2xl pt-12 border-t border-white/5 flex flex-col items-center">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary/40">
                                        <Sparkles size={14} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Signal Scan</span>
                                </div>
                                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-[0.2em] text-center max-w-md leading-loose">
                                    Discovering currently happening quests around your city is coming soon.
                                </p>
                                <div className="mt-6 flex items-center gap-4 opacity-20">
                                    <div className="h-[1px] w-8 bg-white" />
                                    <div className="w-1 h-1 rounded-full bg-white" />
                                    <div className="h-[1px] w-8 bg-white" />
                                </div>
                            </div>
                        </div>
                    )}


                </div>
            </div>

            {/* Persistent Create FAB (Bottom Right) - Only for Logged In Users */}
            {/* Persistent Create FAB (Bottom Right) - Now visible to Guests too */}
            <div className="fixed bottom-32 md:bottom-10 right-6 md:right-10 z-[60]">
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        if (currentUser) {
                            navigate('/app/quests/create');
                        } else {
                            window.dispatchEvent(new CustomEvent('trigger-auth-modal'));
                        }
                    }}
                    id="create-quest-btn"
                    className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:shadow-primary/20 transition-all border border-white/20"
                >
                    <Plus size={28} strokeWidth={3} />
                </motion.button>
            </div>



            <AnimatePresence>
                {showCalendar && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" onClick={() => setShowCalendar(false)}>
                        <div onClick={e => e.stopPropagation()} className="w-full max-w-xs relative">
                            <MinimalCalendar
                                selectedDate={selectedDate}
                                onSelect={(d) => {
                                    setSelectedDate(d);
                                    setLoading(true);
                                    setTimeout(() => setLoading(false), 400);
                                    setShowCalendar(false);
                                }}
                                onClose={() => setShowCalendar(false)}
                            />
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {activeDrop && (
                    <QuestDropModal
                        drop={activeDrop}
                        onClose={() => setActiveDrop(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuestsScreen;
