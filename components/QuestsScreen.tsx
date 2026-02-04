import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Zap, ChevronLeft, MapPin, Search, X, Compass, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
import CreateQuestScreen from './CreateQuestScreen';
import QuestDropModal from './Quest/QuestDropModal';
import QuestDropCard from './Quest/QuestDropCard';

interface QuestsScreenProps {
    onOpenQuest: (q: Quest) => void;
    onOpenCompetition: (c: Competition) => void;
    onOpenMyQuests: () => void;
    onOpenProfile: () => void;
    currentUser: User;
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
    const [showCreate, setShowCreate] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [activeDrop, setActiveDrop] = useState<any>(null);
    const [isMapFull, setIsMapFull] = useState(false);

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

    const handleJoin = async (id: string) => {
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
        // We no longer set global tabs because the Sidebar now handles the switching locally and visually
        // setTabs([...]); 

        // Ensure default tab
        if (!activeTab || (activeTab !== 'CANON' && activeTab !== 'SPONTY')) {
            setActiveTab('CANON');
        }

        // Clear global tabs to hide the floating side pill
        setTabs([]);

        return () => setTabs([]);
    }, []);

    useEffect(() => {
        setActiveCat('All');
    }, [activeTab]);

    useEffect(() => {
        setLoading(true);
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
    }, [activeTab, activeCat, selectedDate, refreshTrigger]);

    return (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden">




            <div
                // ref={containerRef}
                // onScroll={handleScroll}
                className="flex-1 h-full overflow-hidden flex flex-col md:flex-row max-w-[1600px] mx-auto w-full"
            >
                {/* Desktop Sidebar (Left) */}
                <div className="hidden md:flex flex-col w-24 shrink-0 pt-8 sticky top-0 h-full overflow-y-auto no-scrollbar border-r border-white/[0.02]">
                    <QuestSidebar
                        selectedDate={selectedDate}
                        onDateChange={(d) => {
                            setSelectedDate(d);
                            setLoading(true);
                            setTimeout(() => setLoading(false), 400);
                        }}
                        onOpenCalendar={() => setShowCalendar(true)}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        activeCat={activeCat}
                        setActiveCat={setActiveCat}
                    />
                </div>

                {/* Main Feed Content (Right / Center) */}
                <div className="flex-1 h-full overflow-y-auto pb-32 no-scrollbar relative">

                    {/* Mobile Header (Filters) */}
                    <div className="md:hidden pt-6 pb-2 sticky top-0 z-30">
                        <QuestHeader
                            selectedDate={selectedDate}
                            onDateChange={(d) => {
                                setSelectedDate(d);
                                setLoading(true);
                                setTimeout(() => setLoading(false), 400);
                            }}
                            onOpenCalendar={() => setShowCalendar(true)}
                            activeCat={activeCat}
                            setActiveCat={setActiveCat}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    </div>

                    {activeTab === 'CANON' && (
                        <div className="px-4 md:px-8 pt-4 md:pt-8 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-20">
                                {loading ? (
                                    <div className="col-span-full py-20 flex justify-center">
                                        <EKGLoader size={60} />
                                    </div>
                                ) : quests.filter(q => {
                                    if (q.mode !== QuestType.CANON) return false;
                                    if (activeCat !== 'All' && q.category !== activeCat) return false;
                                    const qDate = new Date(q.start_time);
                                    return qDate.getFullYear() === selectedDate.getFullYear() &&
                                        qDate.getMonth() === selectedDate.getMonth() &&
                                        qDate.getDate() === selectedDate.getDate();
                                }).length > 0 ? (
                                    quests.filter(q => {
                                        if (q.mode !== QuestType.CANON) return false;
                                        if (activeCat !== 'All' && q.category !== activeCat) return false;
                                        const qDate = new Date(q.start_time);
                                        return qDate.getFullYear() === selectedDate.getFullYear() &&
                                            qDate.getMonth() === selectedDate.getMonth() &&
                                            qDate.getDate() === selectedDate.getDate();
                                    }).map(q => (
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

                {/* Persistent Create FAB (Bottom Right) */}
                <div className="fixed bottom-32 md:bottom-10 right-6 md:right-10 z-[60]">
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowCreate(true)}
                        className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:shadow-primary/20 transition-all border border-white/20"
                    >
                        <Plus size={28} strokeWidth={3} />
                    </motion.button>
                </div>

                <AnimatePresence>
                    {showCreate && (
                        <CreateQuestScreen
                            currentUser={currentUser}
                            onClose={() => setShowCreate(false)}
                            onQuestCreated={(id, title) => {
                                setShowCreate(false);
                                showToast(`Quest "${title}" deployed!`, "success");
                            }}
                        />
                    )}
                </AnimatePresence>

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
        </div>
    );
};

export default QuestsScreen;
