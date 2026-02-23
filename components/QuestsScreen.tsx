import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, ChevronLeft, MapPin, Search, X, Compass, Plus, Sparkles } from 'lucide-react';
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
    const { setTabs, activeTab, setActiveTab } = useNavigation();
    const [activeCat, setActiveCat] = useState('All');
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
    const lastScrollY = useRef(0);
    const lastTab = useRef(activeTab);
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

        if (id.startsWith('mock-') || id.startsWith('gen-')) {
            showToast("Hunt Joined! (Simulated)", 'success');
            onNavigate('CHATS');
            return;
        }

        const quest = quests.find(q => q.id === id);
        const success = await supabaseService.quests.requestToJoin(id, currentUser?.id, quest?.approval_required);
        if (success) {
            showToast(quest?.approval_required ? "Hunt Requested! 📡" : "Hunt Started! Joining Comms... ⚡", 'success');
            if (!quest?.approval_required) {
                onNavigate('CHATS');
            }
        } else {
            showToast("Failed to start hunt", 'error');
        }
    };

    // Register Tabs
    useEffect(() => {
        // Force default tab to CANON when landing on Quests page
        setActiveTab('CANON');
        // Clear global tabs to hide the floating side pill
        setTabs([]);
        return () => setTabs([]);
    }, []);

    useEffect(() => {
        setActiveCat('All');
    }, [activeTab]);

    // Optimized effect dependencies to prevent full-screen loader on subtle filter changes
    useEffect(() => {
        // Only trigger full loading state for major context switches (Tab change or initial load)
        const isTabSwitch = quests.length === 0 || lastTab.current !== activeTab;
        if (isTabSwitch) setLoading(true);
        lastTab.current = activeTab;

        const type = activeTab === 'CANON' ? QuestType.CANON : QuestType.SPONTY;
        const randomQuests = generateRandomQuests(activeCat, selectedDate, 25, type);

        supabaseService.quests.getQuests(activeCat).then(existingQuests => {
            // Feature: Specific Quests In Order on every date (for Canon)
            let featured: Quest[] = [];
            if (activeTab === 'CANON') {
                const FEATURED_IDS = ['q-psy-1', 'q-sec-1', 'q-trv-1', 'q-trv-2', 'q-sp-1', 'q-and-1', 'q-golf-1', 'q-train-1', 'q-trv-3', 'q-job-1', 'q-soc-2'];
                featured = FEATURED_IDS.map(id => {
                    const q = [...existingQuests, ...randomQuests].find(quest => quest.id === id);
                    if (q) {
                        // Force the date to match selectedDate so it appears on "every date"
                        const newDate = new Date(selectedDate);
                        const originalDate = new Date(q.start_time);
                        newDate.setHours(originalDate.getHours(), originalDate.getMinutes());
                        return { ...q, start_time: newDate.toISOString(), mode: QuestType.CANON };
                    }
                    return null;
                }).filter(Boolean) as Quest[];
            }

            const allQuests = [...featured, ...existingQuests, ...randomQuests].filter(q =>
                q.status === QuestStatus.DISCOVERABLE ||
                !q.status ||
                (q.status === QuestStatus.ACTIVE && q.mode === QuestType.SPONTY)
            );

            // De-duplicate by ID, keeping featured first
            const uniqueQuests = allQuests.filter((q, index, self) =>
                index === self.findIndex((t) => t.id === q.id)
            );

            setQuests(uniqueQuests);
            setLoading(false);
        });
    }, [activeTab, activeCat, selectedDate, refreshTrigger, localRefresh]);

    // Reset scroll to top when major filters change to prevent "falling" to footer
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeTab, activeCat]);

    // Handle incoming questId from URL (Direct to quest card)
    const [searchParams, setSearchParams] = useSearchParams();
    const incomingQuestId = searchParams.get('questId');

    useEffect(() => {
        if (incomingQuestId && quests.length > 0) {
            const targetQuest = quests.find(q => q.id === incomingQuestId);
            if (targetQuest) {
                // Auto-switch date and tab to ensure quest is visible in the filtered list
                if (targetQuest.start_time) {
                    setSelectedDate(new Date(targetQuest.start_time));
                }
                if (targetQuest.mode === QuestType.SPONTY) {
                    setActiveTab('SPONTY');
                } else {
                    setActiveTab('CANON');
                }

                onOpenQuest(targetQuest);

                // Direct to card visually (Scroll into view)
                setTimeout(() => {
                    const el = document.getElementById(`quest-${incomingQuestId}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 800); // Increased delay to account for tab/date switch re-render

                // Clear the param so it doesn't re-open on every render/refresh
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('questId');
                setSearchParams(newParams, { replace: true });
            }
        }
    }, [incomingQuestId, quests, onOpenQuest, searchParams, setSearchParams]);

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

            // Date filter
            const qDate = new Date(q.start_time);
            return qDate.getFullYear() === selectedDate.getFullYear() &&
                qDate.getMonth() === selectedDate.getMonth() &&
                qDate.getDate() === selectedDate.getDate();
        });
    }, [quests, activeTab, activeCat, viewingLocation, selectedDate]);

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
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
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
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                viewingLocation={viewingLocation}
                                setViewingLocation={setViewingLocation}
                            />
                        </div>
                    </motion.div>

                    {activeTab === 'CANON' && (
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

                    {activeTab === 'SPONTY' && (
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
