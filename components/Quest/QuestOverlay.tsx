import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Zap, MessageCircle, ArrowRight, Trophy, X, Calendar, CheckSquare, List, Navigation, Trash, Play, Shield, Check, Globe, Signal, Lock } from 'lucide-react';
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
    const [showGuestPrompt, setShowGuestPrompt] = useState(false);

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
        // Guest Check
        if (!user) {
            setShowGuestPrompt(true);
            return;
        }

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

    const handleGuestAuth = () => {
        setShowGuestPrompt(false);
        navigate('/auth');
    };

    return (
        <AnimatePresence>
            {questId && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center px-2 pt-6 pb-6 md:p-4">
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
                        className="relative w-full max-w-4xl h-full md:h-[85vh] bg-deep-black/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col md:flex-row"
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
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border flex items-center gap-1
                                                    ${quest.visibility_scope === 'public' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' :
                                                        quest.visibility_scope === 'followers' ? 'bg-primary/5 text-primary border-primary/10' :
                                                            'bg-purple-500/5 text-purple-400 border-purple-500/10'}`}>
                                                    {quest.visibility_scope === 'public' ? <Globe size={10} /> : quest.visibility_scope === 'followers' ? <Signal size={10} /> : <Lock size={10} />}
                                                    {quest.visibility_scope}
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
                                                { id: 'details', label: 'Details' },
                                                { id: 'participants', label: 'Participants', mobileOnly: true },
                                                { id: 'itinerary', label: 'The Plan' },
                                                { id: 'checklist', label: 'Essentials' }
                                            ].map(tab => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id as any)}
                                                    className={`pb-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap 
                                                        ${tab.mobileOnly ? 'md:hidden' : ''}
                                                        ${activeTab === tab.id ? 'text-primary' : 'text-gray-600 hover:text-gray-400'}`}
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
                                                    <div className="flex flex-col gap-1 p-4 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#2DD4BF]" />
                                                            <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Location Details</span>
                                                        </div>
                                                        <h4 className="text-lg font-black uppercase text-white leading-tight">
                                                            {quest.location?.place_name || 'Davao City, PH'}
                                                        </h4>
                                                        <p className="text-[9px] text-gray-500 font-medium leading-relaxed">
                                                            {quest.location?.address_full || quest.location?.place_name || 'No address data provided.'}
                                                        </p>
                                                    </div>

                                                    <div className="p-4 rounded-2xl bg-purple-500/[0.03] border border-purple-500/10 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                                                <Calendar className="text-purple-400" size={16} />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-500 mb-0.5">Mission Start</h4>
                                                                <p className="text-xs font-bold text-white leading-tight">
                                                                    {new Date(quest.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} <span className="text-gray-500">@</span> {new Date(quest.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Vibe Signals */}
                                                    {((quest.vibe_signals && quest.vibe_signals.length > 0) || (quest.signals?.vibe && quest.signals.vibe.length > 0)) && (
                                                        <div className="space-y-3">
                                                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">Vibes & Signals</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {[...(quest.vibe_signals || []), ...(quest.signals?.vibe || [])].map((v, i) => (
                                                                    <div key={i} className="px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                                                                        <Zap size={10} />
                                                                        {v}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}

                                            {activeTab === 'participants' && (
                                                <motion.div
                                                    key="participants"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-4 md:hidden"
                                                >
                                                    <div className="space-y-2">
                                                        {/* Inject Mission Lead */}
                                                        {quest.host && (
                                                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                                                                <button
                                                                    onClick={() => navigate(`/app/${quest.host?.id}`)}
                                                                    className="flex items-center gap-3"
                                                                >
                                                                    <div className="shrink-0">
                                                                        <img
                                                                            src={quest.host.avatar_url || `https://ui-avatars.com/api/?name=${quest.host.username}`}
                                                                            className="w-8 h-8 rounded-full object-cover border border-white/10"
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col text-left">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-[10px] font-black text-white uppercase tracking-tight">{quest.host.name || quest.host.username}</span>
                                                                            <span className="text-[6px] bg-primary text-black px-1 py-0.5 rounded font-black">LEAD</span>
                                                                        </div>
                                                                        <p className="text-[8px] text-gray-500 font-bold tracking-tight normal-case">@{(quest.host.handle || quest.host.username || '').toLowerCase().replace(/^@+/, '')}</p>
                                                                    </div>
                                                                </button>
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                                            {participants
                                                                .filter(p => (isHost ? true : p.participant_status === 'ACCEPTED') && p.id !== quest.host?.id)
                                                                .map((p) => (
                                                                    <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                                                                        <button
                                                                            onClick={() => navigate(`/app/${p.id}`)}
                                                                            className="flex items-center gap-2.5 min-w-0"
                                                                        >
                                                                            <div className="relative shrink-0">
                                                                                <img
                                                                                    src={p.avatar_url || `https://ui-avatars.com/api/?name=${p.username}`}
                                                                                    className="w-7 h-7 rounded-full object-cover border border-white/10"
                                                                                />
                                                                                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-deep-black" />
                                                                            </div>
                                                                            <div className="flex flex-col text-left min-w-0">
                                                                                <span className="text-[9px] font-black text-white uppercase tracking-tight truncate">{p.name || p.username}</span>
                                                                                <p className="text-[7px] text-gray-500 font-bold tracking-tight normal-case truncate">@{(p.handle || p.username || '').toLowerCase().replace(/^@+/, '')}</p>
                                                                            </div>
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                        {participants.filter(p => (isHost ? true : p.participant_status === 'ACCEPTED') && p.id !== quest.host?.id).length === 0 && !quest.host && (
                                                            <div className="py-12 text-center border border-white/5 border-dashed rounded-3xl">
                                                                <Users className="mx-auto text-gray-800 mb-2 opacity-30" size={32} />
                                                                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Waiting for signals</p>
                                                            </div>
                                                        )}
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
                                        className="hidden md:flex absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 border border-white/10 items-center justify-center text-gray-500 hover:text-white transition-all hover:bg-white/10 z-50"
                                    >
                                        <X size={16} />
                                    </button>
                                    <div className="hidden md:flex flex-col flex-1 min-h-0 mb-6 mt-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="space-y-0.5">
                                                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Participants</h3>
                                                <p className="text-[7px] text-primary/60 font-black uppercase tracking-widest">{participants.filter(p => p.participant_status === 'ACCEPTED').length} Active</p>
                                            </div>
                                            {isHost && participants.length > 0 && (
                                                <button
                                                    onClick={() => setManagingSquad(!managingSquad)}
                                                    className={`text-[7px] font-black uppercase tracking-widest px-2 py-1.5 rounded-lg border transition-all ${managingSquad ? 'text-red-500 border-red-500/20 bg-red-500/10' : 'text-gray-400 border-white/5 hover:text-white hover:border-white/10'}`}
                                                >
                                                    {managingSquad ? 'Finish' : 'Edit'}
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 gap-2 pr-1 content-start">
                                            {/* Inject Mission Lead */}
                                            {quest.host && (
                                                <div className="col-span-2 flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all group/member">
                                                    <button
                                                        onClick={() => navigate(`/app/${quest.host?.id}`)}
                                                        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity text-left cursor-pointer"
                                                    >
                                                        <div className="shrink-0">
                                                            <img
                                                                src={quest.host.avatar_url || `https://ui-avatars.com/api/?name=${quest.host.username}`}
                                                                className="w-7 h-7 rounded-full object-cover border border-white/5"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[10px] font-black text-white uppercase tracking-tight group-hover/member:text-primary transition-colors">{quest.host.name || quest.host.username}</span>
                                                                <span className="text-[6px] bg-primary text-black px-1 py-0.5 rounded font-black">LEAD</span>
                                                            </div>
                                                            <p className="text-[7px] text-gray-500 font-bold tracking-tight normal-case">@{(quest.host.handle || quest.host.username || '').toLowerCase().replace(/^@+/, '')}</p>
                                                        </div>
                                                    </button>
                                                </div>
                                            )}

                                            {participants
                                                .filter(p => (isHost ? true : p.participant_status === 'ACCEPTED') && p.id !== quest.host?.id)
                                                .map((p) => (
                                                    <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group/member">
                                                        <button
                                                            onClick={() => navigate(`/app/${p.id}`)}
                                                            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity text-left cursor-pointer"
                                                        >
                                                            <div className="relative shrink-0">
                                                                <img
                                                                    src={p.avatar_url || `https://ui-avatars.com/api/?name=${p.username}`}
                                                                    className="w-7 h-7 rounded-full object-cover border border-white/5"
                                                                />
                                                                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-deep-black" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black text-white uppercase tracking-tight group-hover/member:text-primary transition-colors line-clamp-1">{p.name || p.username}</span>
                                                                <p className="text-[7px] text-gray-500 font-bold tracking-tight normal-case">@{(p.handle || p.username || '').toLowerCase().replace(/^@+/, '')}</p>
                                                            </div>
                                                        </button>
                                                        {isHost && (
                                                            <div className="flex items-center gap-1">
                                                                {p.participant_status === 'REQUESTED' && (
                                                                    <button
                                                                        onClick={() => {/* Accept logic would go here if implemented in service */ }}
                                                                        className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center border border-emerald-500/20 shadow-lg"
                                                                    >
                                                                        <Check size={12} />
                                                                    </button>
                                                                )}
                                                                {managingSquad && (
                                                                    <button
                                                                        onClick={() => handleKickParticipant(p.id)}
                                                                        className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/20 shadow-lg"
                                                                    >
                                                                        <Trash size={12} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                            {participants.filter(p => (isHost ? true : p.participant_status === 'ACCEPTED') && p.id !== quest.host?.id).length === 0 && !quest.host && (
                                                <div className="py-8 text-center border border-white/5 border-dashed rounded-2xl">
                                                    <Users className="mx-auto text-gray-800 mb-2 opacity-30" size={24} />
                                                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">No signals</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
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
                                                {joinState === 'idle' && <>Hunt <ArrowRight size={14} /></>}
                                                {joinState === 'requested' && <>Pending...</>}
                                                {joinState === 'joined' && <><MessageCircle size={14} /> Open Comms</>}
                                            </button>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3">
                                                {!isLive ? (
                                                    <button onClick={handleStartQuest} className="col-span-2 py-3.5 rounded-xl bg-electric-teal text-black font-black uppercase text-[8px] tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-2">
                                                        <Play size={12} fill="black" /> Initiate
                                                    </button>
                                                ) : (
                                                    <button onClick={handleFinishQuest} className="col-span-2 py-3.5 rounded-xl bg-primary text-black font-black uppercase text-[8px] tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-2">
                                                        <Trophy size={14} /> Finish
                                                    </button>
                                                )}
                                                <button onClick={handleDeleteQuest} className="col-span-2 py-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase text-[8px] tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all">
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

                        {/* Guest Prompt Modal */}
                        <AnimatePresence>
                            {showGuestPrompt && (
                                <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-[#111] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center space-y-4"
                                    >
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <Zap className="text-primary" size={24} />
                                        </div>
                                        <h3 className="text-lg font-black uppercase text-white tracking-wide">Login to Hunt</h3>
                                        <p className="text-xs text-gray-400 font-medium leading-relaxed">
                                            You need to be logged in to join this quest and chase the lore.
                                        </p>
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <button
                                                onClick={() => setShowGuestPrompt(false)}
                                                className="py-3 rounded-xl bg-white/5 text-gray-400 font-bold text-[10px] uppercase tracking-wider hover:bg-white/10 transition-all"
                                            >
                                                No
                                            </button>
                                            <button
                                                onClick={handleGuestAuth}
                                                className="py-3 rounded-xl bg-primary text-black font-bold text-[10px] uppercase tracking-wider hover:bg-white transition-all"
                                            >
                                                Continue
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )
            }
        </AnimatePresence >
    );
};

export default QuestOverlay;
