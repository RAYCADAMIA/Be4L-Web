import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Zap, MessageCircle, ArrowRight, Trophy, X, Calendar, CheckSquare, List, Navigation, Trash, Play, Shield, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseService } from '../../services/supabaseService';
import { Quest, QuestStatus } from '../../types';
import { EKGLoader } from '../ui/AestheticComponents';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Toast';
import SmartMap from '../ui/SmartMap';

interface QuestOverlayProps {
    questId: string | null;
    onClose: () => void;
}

const QuestOverlay: React.FC<QuestOverlayProps> = ({ questId, onClose }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [quest, setQuest] = useState<Quest | null>(null);
    const [loading, setLoading] = useState(true);
    const [joinState, setJoinState] = useState<'idle' | 'requested' | 'joined'>('idle');
    const [activeTab, setActiveTab] = useState<'details' | 'itinerary' | 'checklist'>('details');
    const [participants, setParticipants] = useState<any[]>([]);
    const [managingSquad, setManagingSquad] = useState(false);

    useEffect(() => {
        if (!questId) {
            setQuest(null);
            setLoading(false);
            return;
        }

        const loadQuest = async () => {
            setLoading(true);
            try {
                const { data } = await supabaseService.quests.getQuestById(questId);
                if (data) {
                    setQuest(data);
                    if (user && data.participant_ids?.includes(user.id)) {
                        setJoinState('joined');
                    }
                    const parts = await supabaseService.quests.getQuestParticipants(questId);
                    setParticipants(parts);
                } else {
                    // Mock fallback for development
                    setQuest({
                        id: questId,
                        title: 'Activity Hub',
                        description: 'Join the squad and participate in this local activity to earn rewards.',
                        category: 'Social',
                        current_participants: 8,
                        max_participants: 15,
                        status: QuestStatus.DISCOVERABLE,
                        start_time: new Date().toISOString(),
                        aura_reward: 100,
                        exp_reward: 150,
                        host: { id: 'host-1', username: 'System', avatar_url: '' },
                        location: { place_name: 'City Center', lat: 7.07, lng: 125.6 },
                        checklist: ['Good Vibe'],
                        itinerary: [{ time: '10:00 AM', description: 'Meetup' }]
                    } as any);
                }
            } catch (err) {
                console.error("Failed to load quest:", err);
            } finally {
                setLoading(false);
            }
        };
        loadQuest();
    }, [questId, user]);

    const isHost = user?.id === quest?.host?.id;
    const isLive = quest?.status === QuestStatus.ACTIVE;

    const handleJoinAction = () => {
        if (joinState === 'joined') {
            onClose();
            navigate('/app/chat', {
                state: {
                    openChatId: `lobby-${questId}`,
                    openChatName: quest?.title || 'Group Chat'
                }
            });
        } else if (joinState === 'idle') {
            if (quest?.approval_required) {
                setJoinState('requested');
                showToast("Join request sent!", "info");
                setTimeout(() => {
                    setJoinState('joined');
                    showToast("Approved!", "success");
                }, 2000);
            } else {
                setJoinState('joined');
                showToast("Joined squad!", "success");
            }
        }
    };

    const handleFinishQuest = async () => {
        if (!questId) return;
        if (window.confirm("Complete activity and award points?")) {
            const { success } = await supabaseService.quests.finishQuest(questId);
            if (success) {
                showToast("Quest Completed!", "success");
                onClose();
            } else {
                showToast("Error finishing quest.", "error");
            }
        }
    };

    const handleStartQuest = async () => {
        if (!questId) return;
        const success = await supabaseService.quests.startQuest(questId);
        if (success) {
            setQuest(prev => prev ? { ...prev, status: QuestStatus.ACTIVE } : null);
            showToast("Quest Started!", "success");
        }
    };

    const handleDeleteQuest = async () => {
        if (!questId) return;
        if (window.confirm("Cancel this quest?")) {
            await supabaseService.quests.cancelQuest(questId);
            showToast("Quest cancelled", "info");
            onClose();
        }
    };

    const handleKickParticipant = async (uid: string) => {
        if (!questId) return;
        if (window.confirm("Remove user?")) {
            const success = await supabaseService.quests.removeQuestParticipant(questId, uid);
            if (success) {
                setParticipants(prev => prev.filter(p => p.id !== uid));
                showToast("User removed", "info");
            }
        }
    };

    return (
        <AnimatePresence>
            {questId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-4xl h-[85vh] bg-deep-black/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col md:flex-row"
                    >
                        {loading ? (
                            <div className="w-full h-full flex items-center justify-center"><EKGLoader /></div>
                        ) : quest ? (
                            <>
                                {/* Left Col: Main Content (Scrollable) */}
                                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
                                    {/* Sticky Header */}
                                    <div className="flex-none p-6 md:p-8 pb-4 flex justify-between items-start bg-gradient-to-b from-deep-black via-deep-black/90 to-transparent z-20">
                                        <div className="space-y-1 pr-4">
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                <span className="px-2 py-0.5 rounded-full bg-primary/5 text-primary text-[8px] font-black uppercase tracking-[0.2em] border border-primary/10">
                                                    {quest.category}
                                                </span>
                                                {isLive && (
                                                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-[0.2em] border border-red-500/20 animate-pulse">
                                                        Live Now
                                                    </span>
                                                )}
                                                <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-400 text-[8px] font-black uppercase tracking-[0.2em] border border-white/10">
                                                    {quest.current_participants}/{quest.max_participants || '∞'} Squad
                                                </span>
                                            </div>
                                            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight uppercase">
                                                {quest.title}
                                            </h2>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="md:hidden w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all shrink-0"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {/* Scrollable Body */}
                                    <div className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-8 pb-32">
                                        {/* Briefing / Desc */}
                                        <div className="mb-8">
                                            <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                                {quest.description}
                                            </p>
                                        </div>

                                        {/* Immersive Tabs */}
                                        <div className="flex gap-6 border-b border-white/5 pb-2 mb-8 overflow-x-auto no-scrollbar">
                                            {[
                                                { id: 'details', label: 'Briefing' },
                                                { id: 'itinerary', label: 'The Plan' },
                                                { id: 'checklist', label: 'Essentials' }
                                            ].map(tab => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id as any)}
                                                    className={`pb-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-primary' : 'text-gray-600 hover:text-gray-400'}`}
                                                >
                                                    {tab.label}
                                                    {activeTab === tab.id && (
                                                        <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        <AnimatePresence mode="wait">
                                            {activeTab === 'details' && (
                                                <motion.div
                                                    key="details"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="space-y-6"
                                                >
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                                                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mb-3 border border-primary/20">
                                                                <MapPin className="text-primary" size={16} />
                                                            </div>
                                                            <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 mb-1">Target Location</h4>
                                                            <p className="text-xs font-bold text-white leading-tight line-clamp-2">{quest.location?.place_name || 'Davao City, PH'}</p>
                                                        </div>
                                                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                                                            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3 border border-purple-500/20">
                                                                <Calendar className="text-purple-400" size={16} />
                                                            </div>
                                                            <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 mb-1">Mission Start</h4>
                                                            <p className="text-xs font-bold text-white leading-tight">
                                                                {new Date(quest.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} <span className="text-gray-500">@</span> {new Date(quest.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Map */}
                                                    <div className="rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/50 relative h-48 md:h-64 shadow-xl">
                                                        <SmartMap
                                                            mode="view"
                                                            initialLocation={quest.location ? {
                                                                lat: quest.location.lat,
                                                                lng: quest.location.lng,
                                                                placeName: quest.location.place_name,
                                                                formattedAddress: quest.location.address_full
                                                            } : undefined}
                                                            height="100%"
                                                            className="z-0"
                                                        />
                                                    </div>

                                                    {/* Squad */}
                                                    <div className="pt-6 border-t border-white/5">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Squad List</h3>
                                                            {isHost && participants.length > 0 && (
                                                                <button
                                                                    onClick={() => setManagingSquad(!managingSquad)}
                                                                    className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${managingSquad ? 'text-red-500 border-red-500/20 bg-red-500/10' : 'text-gray-500 border-white/10 hover:text-white'}`}
                                                                >
                                                                    {managingSquad ? 'Done' : 'Manage'}
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {participants.map((p, idx) => (
                                                                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                                                                    <div className="flex items-center gap-3">
                                                                        <img src={p.avatar_url || `https://ui-avatars.com/api/?name=${p.username}`} className="w-8 h-8 rounded-lg object-cover border border-white/10" />
                                                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{p.username}</span>
                                                                    </div>
                                                                    {managingSquad && isHost && (
                                                                        <button onClick={() => handleKickParticipant(p.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                                                            <Trash size={12} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {activeTab === 'itinerary' && (
                                                <motion.div
                                                    key="itinerary"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-6"
                                                >
                                                    {quest.itinerary && quest.itinerary.length > 0 ? (
                                                        <div className="relative border-l border-white/10 ml-2 space-y-6 py-2">
                                                            {quest.itinerary.map((item, idx) => (
                                                                <div key={idx} className="relative pl-6 group">
                                                                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-deep-black border border-primary group-hover:bg-primary transition-all" />
                                                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all">
                                                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-1">{item.time}</p>
                                                                        <p className="text-sm font-bold text-gray-300">{item.description}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-10 border border-white/5 border-dashed rounded-2xl text-center">
                                                            <List className="mx-auto text-gray-600 mb-2" size={24} />
                                                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">No timeline set</p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}

                                            {activeTab === 'checklist' && (
                                                <motion.div
                                                    key="checklist"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-4"
                                                >
                                                    {quest.checklist && quest.checklist.length > 0 ? (
                                                        quest.checklist.map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all">
                                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-primary">
                                                                    <CheckSquare size={14} />
                                                                </div>
                                                                <p className="text-xs font-bold text-gray-300 uppercase tracking-tight">{item}</p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-10 border border-white/5 border-dashed rounded-2xl text-center">
                                                            <CheckSquare className="mx-auto text-gray-600 mb-2" size={24} />
                                                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">No equipment required</p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Right Col: Actions & Host Info (Sticky on Desktop, Bottom on Mobile) */}
                                <div className="w-full md:w-[320px] md:border-l border-white/5 bg-white/[0.01] flex flex-col p-6 shrink-0 relative z-30">
                                    <button
                                        onClick={onClose}
                                        className="hidden md:flex absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 border border-white/10 items-center justify-center text-gray-500 hover:text-white transition-all hover:bg-white/10"
                                    >
                                        <X size={16} />
                                    </button>

                                    <div className="flex-1 hidden md:block" />

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <div className="relative">
                                                <img
                                                    src={quest.host?.avatar_url || `https://ui-avatars.com/api/?name=${quest.host?.username || 'H'}`}
                                                    className="w-10 h-10 rounded-xl object-cover border border-white/10"
                                                />
                                                <div className="absolute -bottom-1 -right-1 p-0.5 bg-primary rounded-md border border-deep-black">
                                                    <Shield size={8} className="text-black" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-primary">Mission Lead</p>
                                                <p className="text-xs font-bold text-white tracking-wide">{quest.host?.username || 'Network Host'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">
                                                <span>Aura Rewards</span>
                                                <span className="text-primary">+{quest.aura_reward || 100} EXP</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '100%' }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className="h-full bg-gradient-to-r from-primary to-emerald-400"
                                                />
                                            </div>
                                        </div>

                                        {!isHost ? (
                                            <button
                                                onClick={handleJoinAction}
                                                className={`
                                                    w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-black uppercase text-[10px] tracking-[0.2em] shadow-xl
                                                    ${joinState === 'idle' ? 'bg-white text-black hover:bg-primary shadow-white/5' : ''}
                                                    ${joinState === 'requested' ? 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed' : ''}
                                                    ${joinState === 'joined' ? 'bg-primary text-black shadow-primary/20' : ''}
                                                `}
                                            >
                                                {joinState === 'idle' && <>Deploy <ArrowRight size={14} /></>}
                                                {joinState === 'requested' && <>Pending...</>}
                                                {joinState === 'joined' && <><MessageCircle size={14} /> Open Comms</>}
                                            </button>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3">
                                                {!isLive ? (
                                                    <button onClick={handleStartQuest} className="col-span-2 py-4 rounded-2xl bg-electric-teal text-black font-black uppercase text-[9px] tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-2">
                                                        <Play size={12} fill="black" /> Initiate
                                                    </button>
                                                ) : (
                                                    <button onClick={handleFinishQuest} className="col-span-2 py-4 rounded-2xl bg-primary text-black font-black uppercase text-[9px] tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-2">
                                                        <Trophy size={14} /> Finish
                                                    </button>
                                                )}
                                                <button onClick={handleDeleteQuest} className="col-span-2 py-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase text-[9px] tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all">
                                                    Scrub Mission
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center flex-col gap-4">
                                <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xs">Quest Not Found</p>
                                <button onClick={onClose} className="text-xs text-white underline">Close Overlay</button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default QuestOverlay;
