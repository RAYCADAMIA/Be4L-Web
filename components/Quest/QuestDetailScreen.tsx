import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin,
    Users,
    Calendar,
    MessageCircle,
    ArrowRight,
    Check,
    Trophy,
    Trash,
    Play,
    CheckSquare,
    List,
    X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseService } from '../../services/supabaseService';
import { Quest, QuestStatus, QuestParticipantStatus } from '../../types';
import { EKGLoader } from '../ui/AestheticComponents';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Toast';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import QuestSystemModal, { SystemModalType } from './QuestSystemModal';
import QuestHeroHeader from './shared/QuestHeroHeader';
import ParticipantRow from './shared/ParticipantRow';
import EmptyState from '../ui/EmptyState';

type TabId = 'details' | 'participants' | 'itinerary' | 'checklist';

const TABS: { id: TabId; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'participants', label: 'Participants' },
    { id: 'itinerary', label: 'The Plan' },
    { id: 'checklist', label: 'Essentials' },
];

const formatStart = (iso: string): string => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    const datePart = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const tbd = d.getHours() === 23 && d.getMinutes() === 59;
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    if (tbd) return `${datePart} @ TBD`;
    if (hasTime)
        return `${datePart} @ ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return datePart;
};

const QuestDetailScreen: React.FC = () => {
    const { questId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [quest, setQuest] = useState<Quest | null>(null);

    useDocumentTitle(quest ? quest.title : 'Quest Details');
    const [loading, setLoading] = useState(true);
    const [joinState, setJoinState] = useState<'idle' | 'requested' | 'joined'>('idle');
    const [activeTab, setActiveTab] = useState<TabId>('details');
    const [participants, setParticipants] = useState<any[]>([]);
    const [managingSquad, setManagingSquad] = useState(false);

    const [decisionModal, setDecisionModal] = useState<{
        isOpen: boolean;
        type: SystemModalType;
        userId: string;
        userName: string;
    }>({
        isOpen: false,
        type: 'ACCEPT',
        userId: '',
        userName: '',
    });

    useEffect(() => {
        const loadQuest = async () => {
            setLoading(true);
            const { data } = await supabaseService.quests.getQuestById(questId || '');
            if (data) {
                setQuest(data);
                const parts = await supabaseService.quests.getQuestParticipants(questId || '');
                setParticipants(parts);

                if (user) {
                    const myPart = parts.find(
                        (p: any) => p.user_id === user.id || p.id === user.id
                    );
                    if (myPart) {
                        if (
                            myPart.participant_status === QuestParticipantStatus.ACCEPTED ||
                            myPart.status === QuestParticipantStatus.ACCEPTED
                        )
                            setJoinState('joined');
                        else if (
                            myPart.participant_status === QuestParticipantStatus.REQUESTED ||
                            myPart.status === QuestParticipantStatus.REQUESTED
                        )
                            setJoinState('requested');
                        else setJoinState('idle');
                    } else {
                        if (data.host_id === user.id) setJoinState('joined');
                        else setJoinState('idle');
                    }
                }
            } else {
                setQuest({
                    id: questId || 'demo-quest',
                    title: 'Davao Night Market Hunt',
                    description:
                        'Join the squad to find the best street food spots. Earn Aura points for every verified capture.',
                    image_url:
                        'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=1000&auto=format&fit=crop',
                    location: {
                        place_id: '1',
                        place_name: 'Roxas Ave, Davao City',
                        lat: 7.0736,
                        lng: 125.611,
                        address_full: 'Roxas Ave, Davao City',
                    } as any,
                    category: 'Social',
                    host: {
                        id: 'host-1',
                        username: 'NightHunter',
                        avatar_url: 'https://i.pravatar.cc/150?u=a',
                    } as any,
                    current_participants: 12,
                    max_participants: 20,
                    status: QuestStatus.DISCOVERABLE,
                    start_time: new Date().toISOString(),
                    mode: 'canon' as any,
                    approval_required: true,
                    vibe_signals: ['Foodie Heaven', 'Chill', 'Walking'],
                    itinerary: [
                        { time: '06:00 PM', description: 'Meet at Roxas Entrance (Marco Polo side)' },
                        { time: '06:30 PM', description: 'First Round: Isaw & BBQ' },
                        { time: '07:30 PM', description: 'Dessert hunting (Ice Cream Rolls)' },
                        { time: '08:30 PM', description: 'Group Photo & Aura Distribution' },
                    ],
                    checklist: [
                        'Cash (Small bills)',
                        'Comfortable walking shoes',
                        'Empty stomach!',
                        'Powerbank',
                    ],
                } as any);
            }
            setLoading(false);
        };
        loadQuest();
    }, [questId, user]);

    const refreshJoinState = async () => {
        if (!questId || !user) return;
        try {
            const { data } = await supabaseService.quests.getQuestById(questId);
            if (data) {
                setQuest(data);
                const parts = await supabaseService.quests.getQuestParticipants(questId);
                setParticipants(parts);
                const myPart = parts.find((p: any) => p.user_id === user.id || p.id === user.id);
                if (myPart) {
                    if (
                        myPart.participant_status === QuestParticipantStatus.ACCEPTED ||
                        myPart.status === QuestParticipantStatus.ACCEPTED
                    )
                        setJoinState('joined');
                    else if (
                        myPart.participant_status === QuestParticipantStatus.REQUESTED ||
                        myPart.status === QuestParticipantStatus.REQUESTED
                    )
                        setJoinState('requested');
                    else setJoinState('idle');
                } else {
                    if (data.host_id === user.id) setJoinState('joined');
                    else setJoinState('idle');
                }
            }
        } catch (err) {
            console.error('Failed to refresh join state:', err);
        }
    };

    useEffect(() => {
        if (!user || !questId) return;
        const { supabase } = supabaseService as any;
        if (!supabase) return;
        const subscription = supabase
            .channel(`uq-detail-${questId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_quests',
                    filter: `quest_id=eq.${questId}`,
                },
                () => refreshJoinState()
            )
            .subscribe();
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
        const subscription = supabase
            .channel(`quest-state-${questId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'quests',
                    filter: `id=eq.${questId}`,
                },
                (payload: any) => {
                    const updatedQuest = payload.new as Quest;
                    if (updatedQuest && updatedQuest.id === questId) {
                        setQuest((prev) =>
                            prev ? { ...prev, status: updatedQuest.status } : updatedQuest
                        );
                        if (updatedQuest.status === QuestStatus.CANCELLED) {
                            showToast('Mission aborted by Lead.', 'info');
                            navigate('/app/quests');
                        }
                    }
                }
            )
            .subscribe();
        return () => subscription.unsubscribe();
    }, [questId, navigate, showToast]);

    const handleJoinAction = async () => {
        if (!quest || !questId) return;
        if (joinState === 'joined') {
            navigate('/app/chat', {
                state: {
                    openChatId: `lobby-${questId}`,
                    openChatName: quest.title || 'Group Chat',
                },
            });
        } else if (joinState === 'idle') {
            if (!user) {
                showToast('Please sign in to join.', 'error');
                navigate('/auth');
                return;
            }
            const success = await supabaseService.quests.requestToJoin(questId, user.id, true);
            if (success) {
                setJoinState('requested');
                showToast('Request sent! Waiting for host approval.', 'info');
                const parts = await supabaseService.quests.getQuestParticipants(questId);
                setParticipants(parts);
            } else {
                showToast('Failed to send request. Try again.', 'error');
            }
        } else if (joinState === 'requested') {
            showToast('Your request is still pending approval.', 'info');
        }
    };

    const handleFinishQuest = async () => {
        if (!questId) return;
        setDecisionModal({ isOpen: true, type: 'FINISH', userId: '', userName: '' });
    };

    const handleDeleteQuest = async () => {
        if (!questId) return;
        setDecisionModal({ isOpen: true, type: 'CANCEL', userId: '', userName: '' });
    };

    const handleStartQuest = async () => {
        if (!questId) return;
        const success = await supabaseService.quests.startQuest(questId);
        if (success) {
            setQuest((prev) => (prev ? { ...prev, status: QuestStatus.ACTIVE } : null));
            showToast('Quest Started! Focus Mode enabled for participants.', 'success');
        } else {
            showToast('Failed to start quest.', 'error');
        }
    };

    const handleLeaveQuest = async () => {
        setDecisionModal({ isOpen: true, type: 'ABANDON', userId: '', userName: '' });
    };

    const handleStatusAction = (uid: string, action: 'ACCEPT' | 'DECLINE') => {
        const target = participants.find((p) => p.id === uid);
        setDecisionModal({
            isOpen: true,
            type: action,
            userId: uid,
            userName: target?.name || target?.username || 'Unknown Hunter',
        });
    };

    const confirmStatusAction = async () => {
        if (!questId) return;
        const { userId, type } = decisionModal;

        if (type === 'KICK' && userId) {
            const success = await supabaseService.quests.removeQuestParticipant(questId, userId);
            if (success) {
                setParticipants((prev) => prev.filter((p) => p.id !== userId));
                showToast('User removed', 'info');
            } else {
                showToast('Failed to remove user.', 'error');
            }
        } else if (type === 'ABANDON') {
            const success = await supabaseService.quests.leaveQuest(questId);
            if (success) {
                setJoinState('idle');
                showToast('You left the squad.', 'info');
                const parts = await supabaseService.quests.getQuestParticipants(questId);
                setParticipants(parts);
            } else {
                showToast('Failed to leave.', 'error');
            }
        } else if (type === 'CANCEL') {
            await supabaseService.quests.cancelQuest(questId);
            showToast('Quest cancelled', 'info');
            navigate('/app/quests');
        } else if (type === 'FINISH') {
            const { success } = await supabaseService.quests.finishQuest(questId);
            if (success) showToast('Mission Completed!', 'success');
            else showToast('Error finishing quest.', 'error');
        } else if (userId) {
            const status =
                type === 'ACCEPT'
                    ? QuestParticipantStatus.ACCEPTED
                    : QuestParticipantStatus.DECLINED;
            const success = await supabaseService.quests.updateParticipantStatus(
                questId,
                userId,
                status,
                'Confirmed'
            );
            if (success) {
                if (type === 'ACCEPT') {
                    setParticipants((prev) =>
                        prev.map((p) =>
                            p.id === userId
                                ? { ...p, participant_status: QuestParticipantStatus.ACCEPTED }
                                : p
                        )
                    );
                    showToast('Hunter accepted!', 'success');
                } else {
                    setParticipants((prev) => prev.filter((p) => p.id !== userId));
                    showToast('Request declined.', 'info');
                }
            } else {
                showToast('Failed to update status.', 'error');
            }
        }
        setDecisionModal((prev) => ({ ...prev, isOpen: false }));
    };

    const handleKickParticipant = async (uid: string) => {
        const u = participants.find((p) => p.id === uid);
        setDecisionModal({
            isOpen: true,
            type: 'KICK',
            userId: uid,
            userName: u?.name || u?.username || 'Unknown Hunter',
        });
    };

    if (loading)
        return (
            <div className="h-screen flex items-center justify-center bg-[#080707]">
                <EKGLoader />
            </div>
        );
    if (!quest)
        return (
            <div className="h-screen flex items-center justify-center text-[#8B7E6D] font-black uppercase tracking-[0.2em] bg-[#080707]">
                Quest not found
            </div>
        );

    const isHost = user?.id === quest.host?.id;
    const isLive = quest.status === QuestStatus.ACTIVE;

    const squadMembers = participants.filter(
        (p) =>
            p.participant_status === QuestParticipantStatus.ACCEPTED && p.id !== quest.host?.id
    );
    const joinRequests = isHost
        ? participants.filter((p) => p.participant_status === QuestParticipantStatus.REQUESTED)
        : [];

    const primaryCTA = (() => {
        if (isHost) {
            if (!isLive) {
                return (
                    <button
                        onClick={handleStartQuest}
                        className="w-full py-4 rounded-full bg-[#2DD4BF] text-black hover:bg-white shadow-[0_0_30px_rgba(45,212,191,0.3)] transition-all font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95"
                    >
                        <Play size={18} fill="black" /> Start quest
                    </button>
                );
            }
            return (
                <button
                    onClick={handleFinishQuest}
                    className="w-full py-4 rounded-full bg-[#FF8C00] text-black hover:bg-white transition-all font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,140,0,0.3)] hover:scale-[1.02] active:scale-95"
                >
                    <Trophy size={18} /> Extract & complete
                </button>
            );
        }
        return (
            <button
                onClick={handleJoinAction}
                className={`w-full py-4 rounded-full flex items-center justify-center gap-3 transition-all font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-95 ${
                    joinState === 'idle'
                        ? 'bg-white text-[#080707] shadow-[0_10px_30px_rgba(255,255,255,0.15)]'
                        : joinState === 'requested'
                        ? 'bg-white/5 border border-white/10 text-[#8B7E6D]'
                        : 'bg-[#2DD4BF] text-black shadow-[0_0_30px_rgba(45,212,191,0.3)]'
                }`}
            >
                <AnimatePresence mode="wait">
                    {joinState === 'idle' && (
                        <motion.span
                            key="idle"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-2"
                        >
                            Join <ArrowRight size={16} />
                        </motion.span>
                    )}
                    {joinState === 'requested' && (
                        <motion.span
                            key="requested"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-2"
                        >
                            <EKGLoader size={16} /> Signal sent
                        </motion.span>
                    )}
                    {joinState === 'joined' && (
                        <motion.span
                            key="joined"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate('/app/chat', {
                                    state: {
                                        openChatId: `lobby-${questId}`,
                                        openChatName: quest.title,
                                    },
                                });
                            }}
                        >
                            <MessageCircle size={18} /> Open chat
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>
        );
    })();

    const secondaryAction = (() => {
        if (isHost) {
            return (
                <button
                    onClick={handleDeleteQuest}
                    className="w-full py-3.5 rounded-full bg-white/5 text-[#8B7E6D] border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2"
                >
                    <Trash size={14} /> Cancel quest
                </button>
            );
        }
        if (joinState === 'joined') {
            return (
                <button
                    onClick={handleLeaveQuest}
                    className="w-full py-3.5 rounded-full bg-white/5 text-[#8B7E6D] border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2"
                >
                    <X size={14} /> Leave squad
                </button>
            );
        }
        if (joinState === 'requested') {
            return (
                <button
                    onClick={async () => {
                        const success = await supabaseService.quests.leaveQuest(questId!);
                        if (success) {
                            setJoinState('idle');
                            showToast('Request cancelled.', 'info');
                            const parts = await supabaseService.quests.getQuestParticipants(
                                questId!
                            );
                            setParticipants(parts);
                        } else {
                            showToast('Failed to cancel request.', 'error');
                        }
                    }}
                    className="w-full py-2.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-black uppercase text-[9px] tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all"
                >
                    Cancel request
                </button>
            );
        }
        return null;
    })();

    return (
        <div className="min-h-screen bg-[#080707] text-[#F5E6D3] relative overflow-x-hidden pb-32 lg:pb-16">
            {/* Ambient warm glows */}
            <div className="fixed top-0 left-0 w-full h-screen pointer-events-none z-0 opacity-50">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FF8C00]/15 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#800020]/20 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10">
                <QuestHeroHeader quest={quest} onBack={() => navigate(-1)} />
            </div>

            {/* Sticky tab bar */}
            <div className="sticky top-0 z-30 bg-[#080707]/95 backdrop-blur-xl border-b border-white/5 mt-6 lg:mt-8">
                <div className="max-w-5xl mx-auto px-5 md:px-8 flex gap-6 overflow-x-auto no-scrollbar">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-colors relative whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'text-[#FFB854]'
                                    : 'text-[#8B7E6D] hover:text-[#F5E6D3]'
                            }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF8C00] via-[#E34234] to-[#800020] rounded-full"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-5 md:px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
                {/* Main content */}
                <div className="lg:col-span-8 space-y-10">
                    <AnimatePresence mode="wait">
                        {activeTab === 'details' && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                className="space-y-8"
                            >
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFB854]">
                                        Situation report
                                    </h3>
                                    <p className="text-base md:text-lg text-[#F5E6D3]/90 leading-relaxed font-medium">
                                        {quest.description}
                                    </p>
                                </div>

                                {quest.vibe_signals && quest.vibe_signals.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {quest.vibe_signals.map((signal, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1.5 rounded-full bg-[#FF8C00]/10 border border-[#FF8C00]/30 text-[10px] font-black uppercase tracking-[0.15em] text-[#FFB854]"
                                            >
                                                #{signal}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-[#FF8C00]/20 transition-colors relative overflow-hidden">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-[#FF8C00]/10 border border-[#FF8C00]/20 flex items-center justify-center text-[#FFB854]">
                                                <MapPin size={16} />
                                            </div>
                                            <span className="text-[9px] font-black text-[#8B7E6D] uppercase tracking-[0.2em]">
                                                Operational area
                                            </span>
                                        </div>
                                        <h4 className="font-display text-xl font-black uppercase text-[#F5E6D3] leading-tight mb-2">
                                            {quest.location?.place_name || 'Location TBD'}
                                        </h4>
                                        {quest.location?.address_full && (
                                            <p className="text-[11px] text-[#8B7E6D] font-medium leading-relaxed">
                                                {quest.location.address_full}
                                            </p>
                                        )}
                                    </div>
                                    <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-[#FF8C00]/20 transition-colors">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 flex items-center justify-center text-[#2DD4BF]">
                                                <Calendar size={16} />
                                            </div>
                                            <span className="text-[9px] font-black text-[#8B7E6D] uppercase tracking-[0.2em]">
                                                Mission start
                                            </span>
                                        </div>
                                        <h4 className="font-display text-xl font-black uppercase text-[#F5E6D3] leading-tight">
                                            {formatStart(quest.start_time)}
                                        </h4>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'participants' && (
                            <motion.div
                                key="participants"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                className="space-y-8"
                            >
                                <section>
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFB854]">
                                                Confirmed squad
                                            </h3>
                                            <p className="text-[9px] font-bold text-[#8B7E6D] uppercase tracking-widest mt-1">
                                                {squadMembers.length + (quest.host ? 1 : 0)} active
                                            </p>
                                        </div>
                                        {isHost && squadMembers.length > 0 && (
                                            <button
                                                onClick={() => setManagingSquad(!managingSquad)}
                                                className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border transition-all ${
                                                    managingSquad
                                                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                                        : 'bg-white/5 text-[#8B7E6D] border-white/10 hover:text-[#F5E6D3] hover:bg-white/10'
                                                }`}
                                            >
                                                {managingSquad ? 'Done' : 'Manage'}
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {quest.host && (
                                            <ParticipantRow
                                                user={quest.host as any}
                                                accent="host"
                                                onClick={() =>
                                                    navigate(`/app/${quest.host?.id}`)
                                                }
                                            />
                                        )}
                                        {squadMembers.map((p) => (
                                            <ParticipantRow
                                                key={p.id}
                                                user={p}
                                                accent="squad"
                                                onClick={() => navigate(`/app/${p.id}`)}
                                                trailing={
                                                    managingSquad && isHost ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleKickParticipant(p.id);
                                                            }}
                                                            aria-label="Kick"
                                                            className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                                        >
                                                            <Trash size={14} />
                                                        </button>
                                                    ) : null
                                                }
                                            />
                                        ))}
                                    </div>
                                </section>

                                {isHost && joinRequests.length > 0 && (
                                    <section>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFB854] flex items-center gap-2 mb-4">
                                            Join requests
                                            <span className="bg-[#FF8C00]/10 text-[#FFB854] px-2 py-0.5 rounded-full text-[9px]">
                                                {joinRequests.length}
                                            </span>
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {joinRequests.map((p) => (
                                                <ParticipantRow
                                                    key={p.id}
                                                    user={p}
                                                    accent="pending"
                                                    trailing={
                                                        <div className="flex gap-1.5">
                                                            <button
                                                                onClick={() =>
                                                                    handleStatusAction(
                                                                        p.id,
                                                                        'ACCEPT'
                                                                    )
                                                                }
                                                                aria-label="Accept"
                                                                className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all border border-emerald-500/30"
                                                            >
                                                                <Check size={14} strokeWidth={3} />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleStatusAction(
                                                                        p.id,
                                                                        'DECLINE'
                                                                    )
                                                                }
                                                                aria-label="Decline"
                                                                className="w-9 h-9 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/30"
                                                            >
                                                                <X size={14} strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {squadMembers.length === 0 &&
                                    !quest.host &&
                                    joinRequests.length === 0 && (
                                        <EmptyState
                                            icon={<Users size={22} />}
                                            title="No squad yet"
                                            subtitle="Be the first to answer the call."
                                        />
                                    )}
                            </motion.div>
                        )}

                        {activeTab === 'itinerary' && (
                            <motion.div
                                key="itinerary"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                className="space-y-8"
                            >
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFB854]">
                                        Mission timeline
                                    </h3>
                                    <p className="text-[11px] text-[#8B7E6D] uppercase font-bold tracking-widest">
                                        Follow the sequence
                                    </p>
                                </div>
                                {quest.itinerary && quest.itinerary.length > 0 ? (
                                    <div className="relative border-l-2 border-[#FF8C00]/20 ml-2 py-2 space-y-6">
                                        {quest.itinerary.map((item, idx) => (
                                            <div key={idx} className="relative pl-8 group">
                                                <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-[#080707] border-2 border-[#FFB854] group-hover:scale-125 group-hover:bg-[#FFB854] transition-all shadow-[0_0_10px_rgba(255,184,84,0.4)]" />
                                                <div className="p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-[#FF8C00]/20 transition-all group-hover:translate-x-1">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFB854] mb-2">
                                                        {item.time}
                                                    </p>
                                                    <p className="text-sm font-medium text-[#F5E6D3]/90">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={<List size={22} />}
                                        title="No itinerary yet"
                                        subtitle="The host hasn't planned a timeline for this quest."
                                    />
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'checklist' && (
                            <motion.div
                                key="checklist"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                className="space-y-8"
                            >
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFB854]">
                                        Equipment & essentials
                                    </h3>
                                    <p className="text-[11px] text-[#8B7E6D] uppercase font-bold tracking-widest">
                                        What to bring
                                    </p>
                                </div>
                                {quest.checklist && quest.checklist.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {quest.checklist.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-4 p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-[#FF8C00]/20 transition-all"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-[#FFB854]">
                                                    <CheckSquare size={16} />
                                                </div>
                                                <p className="text-sm font-medium text-[#F5E6D3]">
                                                    {item}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={<CheckSquare size={22} />}
                                        title="No essentials listed"
                                        subtitle="Just bring your vibe."
                                    />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar — desktop only */}
                <aside className="hidden lg:block lg:col-span-4">
                    <div className="p-7 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl sticky top-24 shadow-[0_30px_80px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div
                            className={`absolute top-0 left-0 w-full h-1 ${
                                isLive
                                    ? 'bg-red-500'
                                    : 'bg-gradient-to-r from-[#FF8C00] via-[#E34234] to-[#800020]'
                            }`}
                        />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8C00]/10 blur-[60px] rounded-full translate-x-10 -translate-y-4" />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-display text-base font-black uppercase tracking-tighter text-[#F5E6D3]">
                                    Briefing
                                </h3>
                            </div>
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <span className="text-[9px] font-black text-[#8B7E6D] uppercase tracking-widest">
                                        Category
                                    </span>
                                    <span className="text-[10px] font-black text-[#FFB854] uppercase tracking-widest">
                                        {quest.category || 'Vibe'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <span className="text-[9px] font-black text-[#8B7E6D] uppercase tracking-widest">
                                        Squad
                                    </span>
                                    <span className="text-[10px] font-black text-[#F5E6D3] uppercase tracking-widest">
                                        {quest.current_participants ?? squadMembers.length + 1}
                                        {quest.max_participants ? ` / ${quest.max_participants}` : ''}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {primaryCTA}
                                {secondaryAction}
                            </div>
                            <p className="mt-6 text-[9px] text-center text-[#8B7E6D] font-bold uppercase tracking-[0.2em] leading-relaxed">
                                {isHost
                                    ? 'You are the mission lead. Coordinate your squad through the lobby.'
                                    : joinState === 'idle'
                                    ? 'Join the squad for lobby access.'
                                    : joinState === 'requested'
                                    ? 'Awaiting host approval.'
                                    : 'You’re in. Jump into the lobby to coordinate.'}
                            </p>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Mobile sticky CTA */}
            <div className="fixed bottom-0 inset-x-0 z-40 p-4 bg-gradient-to-t from-[#080707] via-[#080707]/95 to-transparent lg:hidden">
                <div className="max-w-md mx-auto space-y-2">
                    {primaryCTA}
                    {secondaryAction}
                </div>
            </div>

            <QuestSystemModal
                isOpen={decisionModal.isOpen}
                type={decisionModal.type}
                userName={decisionModal.userName}
                questTitle={quest?.title}
                onClose={() => setDecisionModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmStatusAction}
            />
        </div>
    );
};

export default QuestDetailScreen;
