import React, { useState, useEffect, useRef } from 'react';
import { Zap, ChevronLeft, MapPin, Search, X, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from './TopBar';
import { supabaseService } from '../services/supabaseService';
import { Quest, QuestType, QuestStatus, User, Competition } from '../types';
import { generateRandomQuests } from '../utils/questGenerator';
import QuestGeneratorUI from './Quest/QuestGeneratorUI';
import QuestCard from './QuestCard';
import QuestMap from './Quest/QuestMap';
import { MissionTimeline, FloatingTabs, EKGLoader } from './ui/AestheticComponents';
import { useToast } from './Toast';

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
    const [activeTab, setActiveTab] = useState<'CANON' | 'SPONTY'>('CANON');
    const [activeCat, setActiveCat] = useState('All');
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showGenerator, setShowGenerator] = useState(false);
    const [isMapFull, setIsMapFull] = useState(false);

    // Scroll Logic for Sync Top Bar
    const [topBarY, setTopBarY] = useState(0);
    const lastScrollY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastClickTimeRef = useRef(0);

    const { showToast } = useToast();

    const handleLogoClick = () => {
        const now = Date.now();
        if (now - lastClickTimeRef.current < 300) {
            onNavigate('LANDING');
        } else {
            containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            if (onReset) onReset();
        }
        lastClickTimeRef.current = now;
    };

    const handleScroll = () => {
        const currentScrollY = containerRef.current?.scrollTop || 0;
        const delta = currentScrollY - lastScrollY.current;

        if (currentScrollY > 10) {
            setTopBarY(prev => {
                const newY = prev - delta;
                return Math.max(-80, Math.min(0, newY));
            });
        } else {
            setTopBarY(0);
        }

        lastScrollY.current = currentScrollY;
    };

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

    useEffect(() => {
        setLoading(true);
        const type = activeTab === 'CANON' ? QuestType.CANON : QuestType.SPONTY;
        const randomQuests = generateRandomQuests(activeCat, selectedDate, 25, type);

        supabaseService.quests.getQuests(activeCat, currentUser?.id).then(existingQuests => {
            // V1 Spec: Discovery ONLY shows DISCOVERABLE quests.
            // ACTIVE quests are removed from discovery.
            const allQuests = [...existingQuests, ...randomQuests].filter(q =>
                q.status === QuestStatus.DISCOVERABLE ||
                !q.status ||
                (q.status === QuestStatus.ACTIVE && q.mode === QuestType.SPONTY)
            );
            setQuests(allQuests);
            setLoading(false);
        });
    }, [activeTab, activeCat, selectedDate, refreshTrigger]);

    return (
        <div className="flex-1 flex flex-col h-full bg-deep-black relative overflow-hidden">
            <TopBar
                visible={true}
                translateY={topBarY}
                onOpenProfile={onOpenProfile}
                user={currentUser}
                onLogoClick={handleLogoClick}
                onSearchClick={() => onNavigate('SEARCH')}
                onNotificationsClick={() => onNavigate('NOTIFICATIONS')}
                onQuestListClick={onOpenQuestList}
                onReset={onReset}
                hasUserPostedToday={hasUserPostedToday}
                onTimerZero={onTimerZero}
            />

            <motion.div
                animate={{ y: topBarY }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="absolute top-[80px] left-0 right-0 z-40 flex items-center justify-center pt-2 pointer-events-none"
            >
                <FloatingTabs
                    activeTab={activeTab}
                    onChange={(val) => setActiveTab(val as 'CANON' | 'SPONTY')}
                    tabs={[
                        { label: 'Canon', value: 'CANON' },
                        { label: 'Sponty', value: 'SPONTY' }
                    ]}
                />
            </motion.div>

            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 h-full overflow-y-auto pb-32 pt-[150px] no-scrollbar"
            >
                {activeTab === 'CANON' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <MissionTimeline
                            selectedDate={selectedDate}
                            onDateChange={(d) => {
                                setSelectedDate(d);
                                setLoading(true);
                                setTimeout(() => setLoading(false), 400);
                            }}
                            daysCount={7}
                        />

                        <div className="px-4">
                            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-2 px-2 py-1">
                                {['All', 'Sports', 'Events', 'Socials', 'Adventure', 'Travel', 'Train', 'Jobs', 'Others'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCat(cat)}
                                        className={`px-5 py-2 rounded-full whitespace-nowrap text-[9px] font-black uppercase tracking-widest transition-all ${activeCat === cat ? 'bg-primary text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]' : 'bg-white/[0.04] text-gray-700 hover:bg-white/[0.08] hover:text-white'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="px-4 space-y-4">
                            {loading ? (
                                <div className="py-12 flex justify-center">
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
                                        onJoin={handleJoin}
                                        onOpenDetail={onOpenQuest}
                                    />
                                ))
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center text-gray-600 border border-white/[0.03] rounded-[2.5rem] bg-white/5">
                                    <Zap size={32} className="mb-2 opacity-50" />
                                    <p className="text-xs font-bold uppercase tracking-widest">No Missions Today</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'SPONTY' && (
                    <div className={`px-4 space-y-4 animate-in fade-in duration-500 ${isMapFull ? 'fixed inset-0 z-[100] bg-deep-black p-0 mt-0 space-y-0' : ''}`}>
                        <div className={`relative transition-all duration-500 overflow-hidden ${isMapFull ? 'h-full rounded-none' : 'h-80 rounded-[2.5rem]'}`}>
                            <QuestMap
                                quests={quests.filter(q => q.mode === QuestType.SPONTY)}
                                onQuestClick={onOpenQuest}
                                isFull={isMapFull}
                            />

                            <div className={`absolute bottom-6 left-6 z-30 flex items-center gap-3 transition-all ${isMapFull ? 'bottom-8 left-8' : ''}`}>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowGenerator(true)}
                                    className="w-10 h-10 bg-primary text-black rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.3)] border border-white/20 hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-shadow"
                                >
                                    <Zap size={20} className="fill-current" />
                                </motion.button>
                            </div>

                            <div className={`absolute bottom-6 right-6 z-30 transition-all ${isMapFull ? 'top-10 right-8 bottom-auto' : ''}`}>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsMapFull(!isMapFull)}
                                    className={`p-3 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl border transition-all ${isMapFull ? 'bg-black/60 border-white/20 text-white' : 'bg-primary text-black border-white/10'}`}
                                >
                                    {isMapFull ? <X size={24} /> : <Compass size={24} />}
                                    {!isMapFull && <span className="ml-2 text-[10px] font-black uppercase tracking-widest pr-1">Full Map</span>}
                                </motion.button>
                            </div>
                        </div>

                        {!isMapFull && (
                            <div className="space-y-4 pt-4 pb-20">
                                {loading ? (
                                    <div className="py-12 flex justify-center">
                                        <EKGLoader size={60} />
                                    </div>
                                ) : quests.filter(q => q.mode === QuestType.SPONTY).length > 0 ? (
                                    quests.filter(q => q.mode === QuestType.SPONTY).map(q => (
                                        <QuestCard
                                            key={q.id}
                                            quest={q}
                                            currentUser={currentUser}
                                            onJoin={handleJoin}
                                            onOpenDetail={onOpenQuest}
                                        />
                                    ))
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center text-gray-600 border border-white/5 rounded-2xl bg-white/5">
                                        <MapPin size={24} className="mb-2 opacity-30" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No Active Sponty Runs</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showGenerator && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowGenerator(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <div className="relative z-10 w-full max-w-sm">
                            <QuestGeneratorUI
                                onAccept={(q) => {
                                    handleJoin(q.id);
                                    setShowGenerator(false);
                                }}
                                onViewDetail={(q) => {
                                    onOpenQuest(q);
                                    setShowGenerator(false);
                                }}
                                onClose={() => setShowGenerator(false)}
                            />
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuestsScreen;
