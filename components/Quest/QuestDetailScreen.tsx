import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Users, Zap, Calendar, Shield, Share2, MessageCircle, ArrowRight, Check, Trophy, Navigation, Trash, Play, CheckSquare, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseService } from '../../services/supabaseService';
import { Quest, QuestStatus, User, QuestParticipantStatus } from '../../types';
import { EKGLoader, GradientButton } from '../ui/AestheticComponents';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Toast';
import SmartMap from '../ui/SmartMap';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import QuestSystemModal, { SystemModalType } from './QuestSystemModal';

const QuestDetailScreen: React.FC = () => {
    const { questId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [quest, setQuest] = useState<Quest | null>(null);

    useDocumentTitle(quest ? quest.title : 'Quest Details');
    const [loading, setLoading] = useState(true);
    const [joinState, setJoinState] = useState<'idle' | 'requested' | 'joined'>('idle');
    const [activeTab, setActiveTab] = useState<'details' | 'participants' | 'itinerary' | 'checklist'>('details');
    const [participants, setParticipants] = useState<any[]>([]);
    const [managingSquad, setManagingSquad] = useState(false);

    // Decision Modal State
    const [decisionModal, setDecisionModal] = useState<{
        isOpen: boolean;
        type: SystemModalType;
        userId: string;
        userName: string;
    }>({
        isOpen: false,
        type: 'ACCEPT',
        userId: '',
        userName: ''
    });

    useEffect(() => {
        const loadQuest = async () => {
            setLoading(true);
            const { data } = await supabaseService.quests.getQuestById(questId || '');
            if (data) {
                setQuest(data);
                const parts = await supabaseService.quests.getQuestParticipants(questId || '');
                setParticipants(parts);

                // Determine join state
                if (user) {
                    const myPart = parts.find((p: any) => p.user_id === user.id || p.id === user.id);
                    if (myPart) {
                        if (myPart.participant_status === QuestParticipantStatus.ACCEPTED || myPart.status === QuestParticipantStatus.ACCEPTED) setJoinState('joined');
                        else if (myPart.participant_status === QuestParticipantStatus.REQUESTED || myPart.status === QuestParticipantStatus.REQUESTED) setJoinState('requested');
                        else setJoinState('idle'); // DECLINED
                    } else {
                        if (data.host_id === user.id) setJoinState('joined');
                        else setJoinState('idle');
                    }
                }
            } else {
                // ... demo quest fallback (keep existing)
                setQuest({
                    id: questId || 'demo-quest',
                    title: 'Davao Night Market Hunt',
                    description: 'Join the squad to find the best street food spots. Earn Aura points for every verified capture.',
                    image_url: 'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=1000&auto=format&fit=crop',
                    location: { place_id: '1', place_name: 'Roxas Ave, Davao City', lat: 7.0736, lng: 125.6110, address_full: 'Roxas Ave, Davao City' }, // Enhanced mock
                    category: 'Social',
                    host: { id: 'host-1', username: 'NightHunter', avatar_url: 'https://i.pravatar.cc/150?u=a' },
                    current_participants: 12,
                    max_participants: 20,
                    status: QuestStatus.DISCOVERABLE,
                    start_time: new Date().toISOString(),
                    mode: 'canon' as any,
                    approval_required: true,
                    vibe_signals: ['Foodie Heaven', 'Chill', 'Walking'],
                    itinerary: [
                        { time: "06:00 PM", description: "Meet at Roxas Entrance (Marco Polo side)" },
                        { time: "06:30 PM", description: "First Round: Isaw & BBQ" },
                        { time: "07:30 PM", description: "Dessert hunting (Ice Cream Rolls)" },
                        { time: "08:30 PM", description: "Group Photo & Aura Distribution" }
                    ],
                    checklist: [
                        "Cash (Small bills)",
                        "Comfortable walking shoes",
                        "Empty stomach!",
                        "Powerbank"
                    ]
                } as any);
            }
            setLoading(false);
        };
        loadQuest();
    }, [questId, user]);

    // Refresh join state and participants from the server
    const refreshJoinState = async () => {
        if (!questId || !user) return;
        try {
            console.log(`[QuestDetail] Re-fetching data for quest ${questId} and user ${user.id}...`);
            const { data } = await supabaseService.quests.getQuestById(questId);
            if (data) {
                setQuest(data);
                const parts = await supabaseService.quests.getQuestParticipants(questId);
                console.log(`[QuestDetail] Participants re-fetched:`, parts.map(p => ({ id: p.id, status: p.participant_status })));
                setParticipants(parts);

                const myPart = parts.find((p: any) => p.user_id === user.id || p.id === user.id);
                console.log(`[QuestDetail] Found myPart:`, myPart);

                if (myPart) {
                    if (myPart.participant_status === QuestParticipantStatus.ACCEPTED || myPart.status === QuestParticipantStatus.ACCEPTED) {
                        setJoinState('joined');
                        console.log(`[QuestDetail] Setting state to JOINED`);
                    } else if (myPart.participant_status === QuestParticipantStatus.REQUESTED || myPart.status === QuestParticipantStatus.REQUESTED) {
                        setJoinState('requested');
                        console.log(`[QuestDetail] Setting state to REQUESTED`);
                    } else {
                        setJoinState('idle');
                        console.log(`[QuestDetail] Setting state to IDLE (other status)`);
                    }
                } else {
                    if (data.host_id === user.id) {
                        setJoinState('joined');
                        console.log(`[QuestDetail] Setting state to JOINED (is host)`);
                    } else {
                        setJoinState('idle');
                        console.log(`[QuestDetail] Setting state to IDLE (no part)`);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to refresh join state:", err);
        }
    };

    useEffect(() => {
        if (!user || !questId) return;

        const { supabase } = supabaseService as any;
        if (!supabase) return;

        // Listen for ANY change to participation in THIS quest
        const subscription = supabase.channel(`uq-detail-${questId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'user_quests',
                filter: `quest_id=eq.${questId}`
            }, () => {
                // Re-fetch from DB instead of relying on payload
                refreshJoinState();
            })
            .subscribe();

        // Also refresh when the browser tab regains focus
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') refreshJoinState();
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            subscription.unsubscribe();
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [questId, user]);

    useEffect(() => {
        if (!questId) return;
        const { supabase } = supabaseService as any;
        if (!supabase) return;

        const subscription = supabase.channel(`quest-state-${questId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'quests',
                filter: `id=eq.${questId}`
            }, (payload: any) => {
                const updatedQuest = payload.new as Quest;
                if (updatedQuest && updatedQuest.id === questId) {
                    setQuest(prev => prev ? { ...prev, status: updatedQuest.status } : updatedQuest);
                    if (updatedQuest.status === QuestStatus.CANCELLED) {
                        showToast("Mission aborted by Lead.", "info");
                        navigate('/app/quests');
                    }
                }
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [questId, navigate, showToast]);

    const handleJoinAction = async () => {
        if (!quest || !questId) return;

        if (joinState === 'joined') {
            // Already joined, go to lobby
            navigate('/app/chat', {
                state: {
                    openChatId: `lobby-${questId}`,
                    openChatName: quest.title || 'Group Chat'
                }
            });
        } else if (joinState === 'idle') {
            // Attempt to join
            if (!user) {
                showToast("Please sign in to join.", "error");
                navigate('/auth');
                return;
            }

            // Every quest now requires approval
            const success = await supabaseService.quests.requestToJoin(questId, user.id, true);
            if (success) {
                setJoinState('requested');
                showToast("Request sent! Waiting for host approval.", "info");

                // Refresh participants list to show the pending request
                const parts = await supabaseService.quests.getQuestParticipants(questId);
                setParticipants(parts);
            } else {
                showToast("Failed to send request. Try again.", "error");
            }
        } else if (joinState === 'requested') {
            showToast("Your request is still pending approval.", "info");
        }
    };

    const handleFinishQuest = async () => {
        if (!questId) return;
        setDecisionModal({
            isOpen: true,
            type: 'FINISH',
            userId: '',
            userName: ''
        });
    };

    const handleDeleteQuest = async () => {
        if (!questId) return;
        setDecisionModal({
            isOpen: true,
            type: 'CANCEL',
            userId: '',
            userName: ''
        });
    };

    const handleStartQuest = async () => {
        if (!questId) return;
        const success = await supabaseService.quests.startQuest(questId);
        if (success) {
            setQuest(prev => prev ? { ...prev, status: QuestStatus.ACTIVE } : null);
            showToast("Quest Started! Focus Mode enabled for participants.", "success");
        } else {
            showToast("Failed to start quest.", "error");
        }
    };

    const handleLeaveQuest = async () => {
        setDecisionModal({
            isOpen: true,
            type: 'ABANDON',
            userId: '',
            userName: ''
        });
    };

    const handleStatusAction = (uid: string, action: 'ACCEPT' | 'DECLINE') => {
        const user = participants.find(p => p.id === uid);
        setDecisionModal({
            isOpen: true,
            type: action,
            userId: uid,
            userName: user?.name || user?.username || 'Unknown Hunter'
        });
    };

    const confirmStatusAction = async () => {
        if (!questId) return;
        const { userId, type } = decisionModal;

        if (type === 'KICK' && userId) {
            const success = await supabaseService.quests.removeQuestParticipant(questId, userId);
            if (success) {
                setParticipants(prev => prev.filter(p => p.id !== userId));
                showToast("User removed", "info");
            } else {
                showToast("Failed to remove user.", "error");
            }
        } else if (type === 'ABANDON') {
            const success = await supabaseService.quests.leaveQuest(questId);
            if (success) {
                setJoinState('idle');
                showToast("You left the squad.", "info");
                const parts = await supabaseService.quests.getQuestParticipants(questId);
                setParticipants(parts);
            } else {
                showToast("Failed to leave.", "error");
            }
        } else if (type === 'CANCEL') {
            await supabaseService.quests.cancelQuest(questId);
            showToast("Quest cancelled", "info");
            navigate('/app/quests');
        } else if (type === 'FINISH') {
            const { success } = await supabaseService.quests.finishQuest(questId);
            if (success) {
                showToast("Mission Completed!", "success");
            } else {
                showToast("Error finishing quest.", "error");
            }
        } else if (userId) {
            const status = type === 'ACCEPT' ? QuestParticipantStatus.ACCEPTED : QuestParticipantStatus.DECLINED;
            const success = await supabaseService.quests.updateParticipantStatus(questId, userId, status, 'Confirmed');

            if (success) {
                if (type === 'ACCEPT') {
                    setParticipants(prev => prev.map(p => p.id === userId ? { ...p, participant_status: QuestParticipantStatus.ACCEPTED } : p));
                    showToast("Hunter accepted!", "success");
                } else {
                    setParticipants(prev => prev.filter(p => p.id !== userId));
                    showToast("Request declined.", "info");
                }
            } else {
                showToast("Failed to update status.", "error");
            }
        }

        setDecisionModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleKickParticipant = async (uid: string) => {
        const u = participants.find(p => p.id === uid);
        setDecisionModal({
            isOpen: true,
            type: 'KICK',
            userId: uid,
            userName: u?.name || u?.username || 'Unknown Hunter'
        });
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-deep-black"><EKGLoader /></div>;
    if (!quest) return <div className="h-screen flex items-center justify-center text-gray-500 font-black uppercase tracking-[0.2em]">Quest not found</div>;

    const isHost = user?.id === quest.host?.id;
    const isLive = quest.status === QuestStatus.ACTIVE;

    const squadMembers = participants.filter(p => p.participant_status === QuestParticipantStatus.ACCEPTED && p.id !== quest.host?.id);
    const joinRequests = isHost ? participants.filter(p => p.participant_status === QuestParticipantStatus.REQUESTED) : [];

    return (
        <div className="min-h-screen bg-deep-black text-white relative overflow-x-hidden pb-40">
            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-0 w-full h-screen pointer-events-none z-0 opacity-40">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            {/* Header Content */}
            <div className="relative pt-32 pb-16 px-6 z-10">
                <div className="max-w-5xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-10 p-3.5 rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/10 text-white hover:bg-white/10 transition-all hover:border-primary/30 active:scale-95 flex items-center gap-2 group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Back to Quests</span>
                    </button>

                    <div className="flex flex-wrap items-center gap-3 mb-8">
                        <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                            {quest.category || 'SOCIAL'}
                        </span>
                        <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-white/5 backdrop-blur-3xl px-4 py-1.5 rounded-full border border-white/10">
                            <Users size={12} className="text-primary" />
                            {quest.current_participants}/{quest.max_participants || '∞'} SQUAD MEMBERS
                        </span>
                        {isLive && (
                            <span className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-[0.2em] bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20 animate-pulse">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> LIVE NOW
                            </span>
                        )}
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white mb-8 leading-[0.9] break-words">
                        {quest.title}
                    </h1>

                    <div className="flex items-center gap-6">
                        {quest.vibe_signals && quest.vibe_signals.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {quest.vibe_signals.map((signal, i) => (
                                    <span key={i} className="text-[9px] font-black uppercase tracking-wider text-primary/60 hover:text-primary transition-colors bg-primary/5 px-4 py-2 rounded-xl border border-primary/20">
                                        #{signal}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-12">
                    {/* Immersive Tabs */}
                    <div className="flex gap-8 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'details', label: 'Details' },
                            { id: 'participants', label: 'Participants' },
                            { id: 'itinerary', label: 'The Plan' },
                            { id: 'checklist', label: 'Essentials' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`pb-4 text-xs font-black uppercase tracking-[0.3em] transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-primary' : 'text-zinc-600 hover:text-zinc-400'}`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {activeTab === 'details' && (
                                <motion.div
                                    key="details"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-12"
                                >
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">SITUATION REPORT</h3>
                                        <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-medium tracking-tight">
                                            {quest.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group backdrop-blur-3xl relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-2 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_#2DD4BF]" />
                                                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Operational Area</span>
                                            </div>
                                            <h4 className="text-3xl md:text-4xl font-black uppercase text-white leading-[0.9] mb-4">
                                                {quest.location?.place_name || 'Davao City, PH'}
                                            </h4>
                                            <div className="flex items-start gap-2 text-gray-500 uppercase tracking-widest text-[10px] font-bold">
                                                <MapPin size={12} className="mt-0.5 shrink-0" />
                                                <p>{quest.location?.address_full || quest.location?.place_name || 'Operational coordinates confirmed.'}</p>
                                            </div>
                                        </div>
                                        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group backdrop-blur-3xl">
                                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                                                <Calendar className="text-purple-400" size={24} />
                                            </div>
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">MISSION START</h4>
                                            <p className="text-lg font-black text-white leading-tight">
                                                {new Date(quest.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                {
                                                    new Date(quest.start_time).getHours() === 23 && new Date(quest.start_time).getMinutes() === 59
                                                        ? ' @ TBD'
                                                        : (new Date(quest.start_time).getHours() !== 0 || new Date(quest.start_time).getMinutes() !== 0) && (
                                                            ` @ ${new Date(quest.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                                        )
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'participants' && (
                                <motion.div
                                    key="participants"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12"
                                >
                                    {/* Squad Section */}
                                    <section>
                                        <div className="flex items-center justify-between mb-10">
                                            <div className="space-y-1">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">CONFIRMED SQUAD</h3>
                                                <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">{squadMembers.length + (quest.host ? 1 : 0)} Active Participants</p>
                                            </div>
                                            {isHost && (squadMembers.length > 0) && (
                                                <button
                                                    onClick={() => setManagingSquad(!managingSquad)}
                                                    className={`text-[9px] font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl border transition-all ${managingSquad ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-white/5 text-gray-500 border-white/10 hover:text-white hover:bg-white/10'}`}
                                                >
                                                    {managingSquad ? 'CLOSE MANAGEMENT' : 'MANAGE SQUAD'}
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-8">
                                            {/* Squad Members Section */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Mission Lead Injection */}
                                                {quest.host && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.98 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="flex items-center justify-between p-4 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all cursor-pointer"
                                                        onClick={() => navigate(`/app/${quest.host?.id}`)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="shrink-0">
                                                                <img
                                                                    src={quest.host.avatar_url || `https://ui-avatars.com/api/?name=${quest.host.username}`}
                                                                    className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-primary/30 transition-all"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-sm font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors">{quest.host.name || quest.host.username}</p>
                                                                    <span className="text-[7px] bg-primary text-black px-1.5 py-0.5 rounded-md font-black tracking-widest uppercase">Lead</span>
                                                                </div>
                                                                <p className="text-[10px] font-bold text-gray-500 tracking-tight normal-case">@{(quest.host.handle || quest.host.username || '').toLowerCase().replace(/^@+/, '')}</p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {squadMembers.map((p, pIdx) => (
                                                    <motion.div
                                                        key={p.id}
                                                        initial={{ opacity: 0, x: -5 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: pIdx * 0.05 }}
                                                        className="flex items-center justify-between p-4 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all cursor-pointer"
                                                        onClick={() => navigate(`/app/${p.id}`)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <img src={p.avatar_url || `https://ui-avatars.com/api/?name=${p.username}`} className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-primary/30 transition-all" />
                                                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-deep-black" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black uppercase tracking-tight text-gray-400 group-hover:text-white transition-colors">{p.name || p.username}</p>
                                                                <p className="text-[10px] font-bold text-gray-500 tracking-tight normal-case">@{(p.handle || p.username || '').toLowerCase().replace(/^@+/, '')}</p>
                                                            </div>
                                                        </div>

                                                        {managingSquad && isHost && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleKickParticipant(p.id);
                                                                }}
                                                                className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/10 shadow-lg"
                                                            >
                                                                <Trash size={16} />
                                                            </button>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>

                                            {/* Join Requests Section (Host Only) */}
                                            {isHost && joinRequests.length > 0 && (
                                                <div className="space-y-4 pt-10 border-t border-white/5">
                                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary flex items-center gap-3">
                                                        Join Requests
                                                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg text-[10px]">{joinRequests.length}</span>
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {joinRequests.map((p) => (
                                                            <motion.div
                                                                key={p.id}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="flex items-center justify-between p-5 rounded-[2.5rem] bg-emerald-500/[0.02] border border-white/5 group hover:border-emerald-500/20 transition-all"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <img
                                                                        src={p.avatar_url || `https://ui-avatars.com/api/?name=${p.username}`}
                                                                        className="w-12 h-12 rounded-full border border-white/10"
                                                                    />
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-black text-white uppercase tracking-tight">{p.name || p.username}</span>
                                                                        <p className="text-[10px] font-bold text-gray-500">@{(p.handle || p.username || '').toLowerCase().replace(/^@+/, '')}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleStatusAction(p.id, 'ACCEPT')}
                                                                        className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/10 shadow-lg"
                                                                    >
                                                                        <Check size={20} strokeWidth={3} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleStatusAction(p.id, 'DECLINE')}
                                                                        className="w-11 h-11 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/10 shadow-lg"
                                                                    >
                                                                        <X size={20} strokeWidth={3} />
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {squadMembers.length === 0 && !quest.host && joinRequests.length === 0 && (
                                                <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white/[0.02] rounded-[3rem] border border-white/5 border-dashed">
                                                    <Users className="text-gray-700 mb-4" size={48} />
                                                    <p className="text-xs uppercase font-black text-gray-600 tracking-widest">No Join Requests Yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </motion.div>
                            )}

                            {activeTab === 'itinerary' && (
                                <motion.div
                                    key="itinerary"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12"
                                >
                                    <div className="space-y-2">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">MISSION TIMELINE</h3>
                                        <p className="text-sm text-gray-500 uppercase font-bold tracking-widest">Follow the sequence for a successful mission</p>
                                    </div>

                                    {quest.itinerary && quest.itinerary.length > 0 ? (
                                        <div className="relative border-l-2 border-primary/20 ml-4 py-4 space-y-12">
                                            {quest.itinerary.map((item, idx) => (
                                                <div key={idx} className="relative pl-12 group">
                                                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-lg bg-deep-black border-2 border-primary group-hover:scale-125 group-hover:bg-primary transition-all shadow-[0_0_10px_rgba(45,212,191,0.3)]" />
                                                    <div className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all backdrop-blur-3xl group-hover:translate-x-2">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">{item.time}</p>
                                                        <p className="text-lg font-bold text-zinc-300 group-hover:text-white transition-colors">{item.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-24 bg-white/[0.02] rounded-[3rem] border border-white/5 border-dashed">
                                            <List className="text-gray-700 mb-4" size={48} />
                                            <p className="text-xs uppercase font-black text-gray-600 tracking-widest">No formal timeline recorded for this mission.</p>
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
                                    className="space-y-12"
                                >
                                    <div className="space-y-2">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">EQUIPMENT & ESSENTIALS</h3>
                                        <p className="text-sm text-gray-500 uppercase font-bold tracking-widest">Items required to participate in this quest</p>
                                    </div>

                                    {quest.checklist && quest.checklist.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {quest.checklist.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-6 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl group hover:border-primary/30 transition-all">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                                                        <CheckSquare size={20} className="text-primary opacity-40 group-hover:opacity-100" />
                                                    </div>
                                                    <p className="text-base font-bold text-zinc-300 group-hover:text-white transition-all uppercase tracking-tight">{item}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-24 bg-white/[0.02] rounded-[3rem] border border-white/5 border-dashed">
                                            <CheckSquare className="text-gray-700 mb-4" size={48} />
                                            <p className="text-xs uppercase font-black text-gray-600 tracking-widest">No specific items required. Just bring your vibe.</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Sidebar Sticky Briefing Panel */}
                <div className="lg:col-span-4">
                    <div className="p-10 rounded-[3rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl sticky top-32 lg:translate-y-[-100px] shadow-2xl relative overflow-hidden group">
                        {/* Status Liquid Background Effect */}
                        <div className={`absolute top-0 left-0 w-full h-2 ${isLive ? 'bg-red-500 animate-pulse' : 'bg-primary'}`} />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full translate-x-16 translate-y-[-16px]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-lg font-black uppercase tracking-widest text-white">Details</h3>
                                <Zap className="text-primary group-hover:animate-bounce" size={24} />
                            </div>

                            <div className="space-y-8 mb-12">


                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Difficulty</span>
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Common</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Category</span>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{quest.category || 'Vibe'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Matrix */}
                            <div className="space-y-4">
                                {!isHost ? (
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleJoinAction}
                                            className={`
                                              w-full py-4 rounded-3xl flex items-center justify-center gap-4 transition-all active:scale-95 font-black uppercase tracking-widest text-[11px] overflow-hidden relative
                                              ${joinState === 'idle' ? 'bg-white text-black hover:bg-primary shadow-xl hover:shadow-primary/20' : ''}
                                              ${joinState === 'requested' ? 'bg-white/5 border border-white/10 text-gray-500' : ''}
                                              ${joinState === 'joined' ? 'bg-primary text-black shadow-lg shadow-primary/20' : ''}
                                          `}
                                        >
                                            <AnimatePresence mode="wait">
                                                {joinState === 'idle' && (
                                                    <motion.div
                                                        key="idle"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="flex items-center gap-3"
                                                    >
                                                        JOIN <ArrowRight size={16} />
                                                    </motion.div>
                                                )}
                                                {joinState === 'requested' && (
                                                    <motion.div
                                                        key="requested"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="flex items-center gap-3"
                                                    >
                                                        <EKGLoader size={16} /> SIGNAL SENT
                                                    </motion.div>
                                                )}
                                                {joinState === 'joined' && (
                                                    <div className="flex items-center gap-4 w-full">
                                                        <motion.div
                                                            key="joined"
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            className="flex-1 flex items-center justify-center gap-3"
                                                            onClick={(e) => { e.stopPropagation(); navigate('/app/chat', { state: { openChatId: `lobby-${questId}`, openChatName: quest?.title } }); }}
                                                        >
                                                            <MessageCircle size={18} /> Open Chat
                                                        </motion.div>
                                                        <div className="w-[1px] h-6 bg-black/10" />
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleLeaveQuest(); }}
                                                            className="px-6 py-4 hover:bg-black/5 rounded-3xl transition-all"
                                                            title="Leave Squad"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </AnimatePresence>
                                        </button>
                                        {joinState === 'requested' && (
                                            <button
                                                onClick={async () => {
                                                    const success = await supabaseService.quests.leaveQuest(questId!);
                                                    if (success) {
                                                        setJoinState('idle');
                                                        showToast("Request cancelled.", "info");
                                                        const parts = await supabaseService.quests.getQuestParticipants(questId!);
                                                        setParticipants(parts);
                                                    } else {
                                                        showToast("Failed to cancel request.", "error");
                                                    }
                                                }}
                                                className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase text-[8px] tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                Cancel Request
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4 pt-6 border-t border-white/10">
                                        {!isLive ? (
                                            <button
                                                onClick={handleStartQuest}
                                                className="w-full py-4 rounded-3xl bg-electric-teal text-black hover:bg-white shadow-xl shadow-electric-teal/10 transition-all font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3"
                                            >
                                                <Play size={18} fill="black" /> START QUEST
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleFinishQuest}
                                                className="w-full py-4 rounded-3xl border-2 border-primary bg-primary text-black hover:bg-white transition-all font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                                            >
                                                <Trophy size={18} /> EXTRACT & COMPLETE
                                            </button>
                                        )}

                                        <button
                                            onClick={handleDeleteQuest}
                                            className="w-full py-3.5 rounded-3xl bg-white/5 text-gray-500 border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500 transition-all font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2"
                                        >
                                            <Trash size={14} /> CANCEL QUEST
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <p className="text-[8px] text-center text-gray-600 font-bold uppercase tracking-[0.2em] leading-relaxed">
                                    {isHost ? "You are the mission lead. Coordinate your squad through the lobby chat and verify completion." :
                                        (joinState === 'idle' ? "Join the squad to receive a private lobby link and start the mission." :
                                            joinState === 'requested' ? "Your request is being reviewed by the mission lead. You'll be notified of approval." :
                                                "You are officially part of the mission. Use the lobby link to coordinate in real-time.")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <QuestSystemModal
                isOpen={decisionModal.isOpen}
                type={decisionModal.type}
                userName={decisionModal.userName}
                questTitle={quest?.title}
                onClose={() => setDecisionModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmStatusAction}
            />
        </div>
    );
};

export default QuestDetailScreen;
