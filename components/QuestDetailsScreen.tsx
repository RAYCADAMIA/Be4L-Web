import React, { useState, useEffect } from 'react';
import { Clock, MapPin, MessageSquare, ChevronLeft, User as UserIcon, Trash2, Edit2, Check, X, Share, LogOut, Wallet, Bell, AlertCircle, Send, Play, Zap, Trophy, Camera, UserPlus, Lock, ArrowUpRight, ClipboardList, Copy, Share2, History } from 'lucide-react';
import { Quest, QuestStatus, User, QuestType, QuestRequest, Capture } from '../types';
import { OTHER_USERS, COLORS } from '../constants';
import { supabaseService } from '../services/supabaseService';
import ProfileScreen from './ProfileScreen';
import { GradientButton, GlassCard } from './ui/AestheticComponents';
import SquadReviewModal from './Quest/SquadReviewModal';
import CameraFlow from './CameraFlow';
import DualCameraPost from './DualCameraPost';
import { dailyService } from '../services/dailyService';

interface QuestDetailsScreenProps {
    quest: Quest;
    currentUser: User;
    onClose: () => void;
    onJoin: () => void;
    onNavigate: (tab: 'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS' | 'PROFILE') => void;
    onOpenChat?: (id: string, name: string) => void;
}

const QuestDetailsScreen: React.FC<QuestDetailsScreenProps> = ({ quest, currentUser, onClose, onJoin, onNavigate, onOpenChat }) => {
    const isHost = quest.host_id === currentUser.id;
    const [localQuest, setLocalQuest] = useState<Quest>(quest);
    const participants = localQuest.participants || (localQuest.host ? [localQuest.host] : []);
    const isParticipant = participants.some(p => p.id === currentUser.id);
    const readyIds = localQuest.ready_ids || [];
    const isReady = readyIds.includes(currentUser.id);

    const [viewingProfile, setViewingProfile] = useState<User | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [invitedIds, setInvitedIds] = useState<string[]>([]);
    const [pendingRequests, setPendingRequests] = useState<QuestRequest[]>([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);
    const [isAddedToSideQuests, setIsAddedToSideQuests] = useState(false);
    const [questCaptures, setQuestCaptures] = useState<Capture[]>([]);
    const [loadingCaptures, setLoadingCaptures] = useState(false);

    // Countdown State
    const [timeLeftStr, setTimeLeftStr] = useState<string>("");

    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

    const showNotification = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
        setNotification({ message: msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const getQuestImage = () => {
        if (localQuest.category === 'Basketball') return 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1000';
        if (localQuest.category === 'Gym') return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000';
        return 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1000';
    };

    useEffect(() => {
        if (isHost && localQuest.status === QuestStatus.DISCOVERABLE) {
            fetchRequests();
        }
        fetchQuestCaptures();
    }, [isHost, localQuest.id]);

    const fetchQuestCaptures = async () => {
        setLoadingCaptures(true);
        try {
            // Find all captures linked to this quest_id
            const data = await supabaseService.captures.getAllFeed();
            const filtered = data.filter(c => c.quest_id === localQuest.id);
            setQuestCaptures(filtered);
        } catch (e) { console.error(e); }
        setLoadingCaptures(false);
    };

    // Side Quest Logic
    useEffect(() => {
        const checkStatus = () => {
            const taskText = `Complete: ${localQuest.title}`;
            const exists = dailyService.hasTask(taskText);
            setIsAddedToSideQuests(exists);

            // Auto-add if active participant
            if (isParticipant && localQuest.status === QuestStatus.ACTIVE && !exists) {
                dailyService.addTask(taskText);
                setIsAddedToSideQuests(true);
                showNotification("Added Active Quest to Side Quests!", "success");
            }
        };
        checkStatus();
    }, [localQuest.title, localQuest.status, isParticipant]);

    const handleAddToSideQuests = () => {
        const taskText = `Complete: ${localQuest.title}`;
        if (isAddedToSideQuests) {
            showNotification("Already in Side Quests", "info");
            return;
        }
        dailyService.addTask(taskText);
        setIsAddedToSideQuests(true);
        showNotification("Added to Side Quests!", "success");
    };

    // Countdown Logic
    useEffect(() => {
        if (localQuest.status === QuestStatus.ACTIVE || localQuest.status === QuestStatus.COMPLETED) return;

        const updateTimer = () => {
            const now = new Date();
            const start = new Date(localQuest.start_time);
            const diff = start.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeftStr("Starting Now");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) setTimeLeftStr(`${days}d ${hours}h`);
            else if (hours > 0) setTimeLeftStr(`${hours}h ${minutes}m`);
            else setTimeLeftStr(`${minutes}m`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [localQuest.start_time, localQuest.status]);


    const fetchRequests = async () => {
        setIsLoadingRequests(true);
        const reqs = await supabaseService.quests.getRequestsForQuest(localQuest.id);
        setPendingRequests(reqs);
        setIsLoadingRequests(false);
    };

    const handleAcceptRequest = async (req: QuestRequest) => {
        if (!req.user) return;
        const success = await supabaseService.quests.acceptRequest(req.id, localQuest.id, req.user_id);
        if (success) {
            setPendingRequests(prev => prev.filter(r => r.id !== req.id));
            setLocalQuest(prev => ({
                ...prev,
                current_participants: (prev.current_participants || 1) + 1,
                participants: [...(prev.participants || []), req.user!]
            }));
            showNotification(`Accepted ${req.user.username}!`, 'success');
        }
    };

    const handleEscalate = async () => {
        if (window.confirm("Escalate this to a Spontaneous Quest? This will make it LIVE now!")) {
            const success = await supabaseService.quests.escalateCanonToSponty(localQuest.id);
            if (success) {
                setLocalQuest(prev => ({
                    ...prev,
                    mode: QuestType.SPONTY,
                    status: QuestStatus.ACTIVE
                }));
                showNotification("Escalated to SPONTY! ⚡", "success");
            }
        }
    };

    const handleBack = () => {
        if (viewingProfile) setViewingProfile(null);
        else onClose();
    };

    const handleKick = async (userId: string) => {
        if (window.confirm("Kick this user from the quest?")) {
            const success = await supabaseService.quests.kickParticipant(localQuest.id, userId);
            if (success) {
                setLocalQuest(prev => ({
                    ...prev,
                    participants: prev.participants?.filter(p => p.id !== userId),
                    ready_ids: prev.ready_ids?.filter(id => id !== userId)
                }));
                showNotification("User kicked.", "success");
            }
        }
    };

    const initiateCancel = () => setShowCancelModal(true);
    const confirmCancel = () => { setShowCancelModal(false); setShowReasonModal(true); };
    const finalizeCancel = async () => {
        if (!cancelReason) {
            showNotification("Please select a reason.", "error");
            return;
        }
        setIsCancelling(true);
        await supabaseService.quests.cancelQuest(localQuest.id, cancelReason);
        setIsCancelling(false);
        onClose();
    };

    const handleProceed = async () => {
        if (localQuest.status === QuestStatus.DISCOVERABLE || localQuest.status === QuestStatus.LOBBY) {
            const notReadyCount = participants.filter(p => !(localQuest.ready_ids || []).includes(p.id)).length;
            if (notReadyCount > 0) {
                if (!confirm(`${notReadyCount} participant(s) aren't ready yet. Start anyway?`)) return;
            }

            const success = await supabaseService.quests.startQuest(localQuest.id);
            if (success) {
                setLocalQuest(prev => ({ ...prev, status: QuestStatus.ACTIVE }));
                showNotification("Quest Started! Game On! 🎮", "success");
            }
        } else if (localQuest.status === QuestStatus.ACTIVE) {
            setShowCamera(true);
        }
    };

    const handleManualComplete = async () => {
        if (localQuest.status !== QuestStatus.ACTIVE) return;
        if (!confirm("Stop this mission now? All participants will be rewarded based on quest goals.")) return;

        const success = await supabaseService.quests.completeQuest(localQuest.id);
        if (success) {
            setLocalQuest(prev => ({ ...prev, status: QuestStatus.COMPLETED }));
            showNotification("Quest Completed! Distributed Aura. 🎉", "success");
            setShowReviewModal(true);
        }
    };

    const handleQuestCaptured = async () => {
        const success = await supabaseService.quests.completeQuest(localQuest.id);
        if (success) {
            setLocalQuest(prev => ({ ...prev, status: QuestStatus.COMPLETED }));
            showNotification("Quest Completed! 🎉", "success");
            setShowReviewModal(true);
        } else {
            showNotification("Capture posted, but failed to close quest. Try again.", "error");
        }
    };

    const toggleReady = async () => {
        const success = await supabaseService.quests.toggleReadyStatus(localQuest.id, currentUser.id);
        if (success) {
            setLocalQuest(prev => {
                const currentReady = prev.ready_ids || [];
                const isNowReady = !currentReady.includes(currentUser.id);
                return {
                    ...prev,
                    ready_ids: isNowReady ? [...currentReady, currentUser.id] : currentReady.filter(id => id !== currentUser.id)
                };
            });
            showNotification(isReady ? "Set to Not Ready" : "Set to Ready!", "success");
        }
    };

    const handleEchoClick = async () => {
        // Ensure we have at least the host to message
        const currentParticipants = participants && participants.length > 0
            ? participants
            : (localQuest.host ? [localQuest.host] : []);

        if (currentParticipants.length === 0) {
            showNotification("No one to message yet", "error");
            return;
        }

        let targetEcho: { id: string, name: string } | null = null;
        const allMemberIds = Array.from(new Set([localQuest.host_id, ...currentParticipants.map(p => p.id)]));

        // Spec: Participants > 2 -> Lobby. 
        if (allMemberIds.length > 2) {
            targetEcho = await supabaseService.chat.getOrCreateQuestLobby(
                localQuest.id,
                `Lobby: ${localQuest.title}`,
                allMemberIds
            );
        } else {
            // 1-on-1 with host or participant
            if (isHost) {
                const otherParticipant = currentParticipants.find(p => p.id !== currentUser.id);
                if (otherParticipant) {
                    targetEcho = await supabaseService.chat.getOrCreatePersonalChat(
                        currentUser.id,
                        otherParticipant.id,
                        otherParticipant.username
                    );
                } else {
                    showNotification("Waiting for hunters...", "info");
                }
            } else if (localQuest.host) {
                targetEcho = await supabaseService.chat.getOrCreatePersonalChat(
                    currentUser.id,
                    localQuest.host_id,
                    localQuest.host.username
                );
            }
        }

        if (targetEcho && onOpenChat) {
            onOpenChat(targetEcho.id, targetEcho.name);
            onNavigate('CHATS');
        } else if (!targetEcho && !isHost) {
            showNotification("Connecting to host...", "info");
        }
    };

    if (viewingProfile) {
        return (
            <ProfileScreen
                user={viewingProfile}
                onBack={() => setViewingProfile(null)}
                currentUser={currentUser}
                onLogout={() => { }} onOpenPostDetail={() => { }} onOpenMyQuests={() => { }} onOpenUser={(u) => setViewingProfile(u)} onProfileUpdate={() => { }}
            />
        );
    }

    return (
        <div className="absolute inset-0 z-[60] bg-black flex flex-col animate-in slide-in-from-bottom duration-300 safe-area-bottom overflow-y-auto font-sans no-scrollbar">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-12 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-[70] flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${notification.type === 'error' ? 'bg-red-500 text-white' : notification.type === 'success' ? 'bg-green-500 text-black' : 'bg-[#1A1A1A] text-white border border-white/20'}`}>
                    {notification.type === 'error' ? <AlertCircle size={18} /> : notification.type === 'success' ? <Check size={18} /> : <Bell size={18} />}
                    <span className="text-xs font-bold uppercase tracking-wide">{notification.message}</span>
                </div>
            )}

            {/* Header Image Area */}
            <div className="relative h-80 w-full shrink-0">
                <img src={getQuestImage()} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />

                {/* Top Nav */}
                <div className="absolute top-0 left-0 right-0 p-6 pt-12 flex justify-between items-start z-10">
                    <button onClick={handleBack} className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/20 transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    {isHost && localQuest.status === QuestStatus.DISCOVERABLE && (
                        <div className="flex gap-2">
                            <button onClick={initiateCancel} className="p-2 bg-red-500/20 backdrop-blur-md rounded-full text-red-500 border border-red-500/30 hover:bg-red-500/40 transition-all">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Title & Tags */}
                <div className="absolute bottom-4 left-6 right-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {/* Category • Activity */}
                        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-sm">
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{localQuest.category}</span>
                            <div className="w-1 h-1 rounded-full bg-white/30" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{localQuest.activity}</span>
                        </div>

                        {!isParticipant && localQuest.status === QuestStatus.DISCOVERABLE && (
                            <span className="bg-green-500 text-black px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                                Hunting...
                            </span>
                        )}
                        {localQuest.status === QuestStatus.ACTIVE && (
                            <span className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                                LIVE
                            </span>
                        )}
                        {localQuest.status === QuestStatus.LOBBY && (
                            <span className="bg-yellow-500 text-black px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                                LOBBY OPEN
                            </span>
                        )}
                        {localQuest.status === QuestStatus.COMPLETED && (
                            <span className="bg-white/20 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                COMPLETED
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl font-black italic text-white tracking-tighter leading-[0.9] drop-shadow-lg max-w-[95%]">
                        {localQuest.title}
                    </h1>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 px-5 pb-40 space-y-8 bg-black">

                {/* HOST ACTIONS */}
                {isHost && localQuest.mode === QuestType.CANON && localQuest.status === QuestStatus.DISCOVERABLE && (
                    <div className="mt-6 px-4 py-3 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Running Late?</p>
                            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tight">Escalate to Sponty for 150 Aura</p>
                        </div>
                        <button
                            onClick={handleEscalate}
                            className="bg-primary text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
                        >
                            Escalate
                        </button>
                    </div>
                )}

                {/* Pending Requests */}
                {isHost && pendingRequests.length > 0 && (
                    <div className="space-y-4 pt-4">
                        <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                            <UserPlus size={14} /> Pending Requests ({pendingRequests.length})
                        </h3>
                        <div className="space-y-2">
                            {pendingRequests.map(req => (
                                <GlassCard key={req.id} className="p-3 border-primary/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img src={req.user?.avatar_url} className="w-10 h-10 rounded-full border border-white/10" />
                                            <div>
                                                <p className="text-white font-bold text-sm">{req.user?.name}</p>
                                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">@{req.user?.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleAcceptRequest(req)} className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center"><Check size={16} strokeWidth={3} /></button>
                                            <button className="w-8 h-8 rounded-full bg-white/5 text-gray-500 flex items-center justify-center border border-white/10"><X size={16} /></button>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                )}

                {/* Time Block with COUNTDOWN */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="bg-[#121212] border border-white/5 p-4 rounded-2xl flex flex-col justify-between h-24 relative overflow-hidden group">
                        <div className="absolute right-[-10px] top-[-10px] w-16 h-16 bg-primary/10 rounded-full blur-xl"></div>
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2 text-primary">
                            <Clock size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Time</p>
                            <p className="text-white font-black text-xs uppercase">
                                {new Date(localQuest.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {localQuest.end_time ? new Date(localQuest.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'END'}
                            </p>
                        </div>
                    </div>
                    <div className="bg-[#121212] border border-white/5 p-4 rounded-2xl flex flex-col justify-between h-24 relative overflow-hidden group">
                        <div className="absolute right-[-10px] top-[-10px] w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2 text-blue-500">
                            {localQuest.status === QuestStatus.ACTIVE ? <Play size={16} fill="currentColor" /> : <Clock size={16} />}
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5">
                                {localQuest.status === QuestStatus.ACTIVE ? 'Status' : 'Starting In'}
                            </p>
                            {localQuest.status === QuestStatus.ACTIVE ? (
                                <p className="text-red-500 font-black text-lg uppercase tracking-tight animate-pulse">ACTIVE NOW</p>
                            ) : timeLeftStr ? (
                                <p className="text-blue-400 font-black text-lg uppercase tracking-tight">{timeLeftStr}</p>
                            ) : (
                                <p className="text-white font-black text-sm uppercase">
                                    {new Date(localQuest.start_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Host Info */}
                <GlassCard className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setViewingProfile(localQuest.host || null)}>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img src={localQuest.host?.avatar_url || 'https://picsum.photos/100/100?random=1'} className="w-14 h-14 rounded-xl object-cover border border-white/10" />
                            <div className="absolute -bottom-1 -right-1 bg-primary px-1.5 py-0.5 rounded text-[8px] font-black text-black">
                                HOST
                            </div>
                        </div>
                        <div>
                            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5 block">Initiated By</span>
                            <span className="text-white font-black text-lg tracking-tight">{localQuest.host?.username || 'Unknown'}</span>
                        </div>
                    </div>
                    <button onClick={handleEchoClick} className="p-3 bg-white/5 rounded-full text-white hover:bg-white/10 transition-colors">
                        <MessageSquare size={18} />
                    </button>
                </GlassCard>

                {/* Description */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">The Objective</h3>
                        <button
                            onClick={handleAddToSideQuests}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-[9px] font-black uppercase tracking-widest ${isAddedToSideQuests ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                            {isAddedToSideQuests ? 'In Quest List' : 'Add to Quest List'}
                        </button>
                    </div>
                    <p className="text-gray-300 text-lg font-medium leading-relaxed italic border-l-2 border-primary/50 pl-4 py-1">
                        "{localQuest.description || "No specific instructions provided."}"
                    </p>
                </div>

                {/* Signals */}
                {localQuest.signals && (
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Quest Signals</h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(localQuest.signals).flat().map((sig, idx) => (
                                <span key={`${sig}-${idx}`} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    {sig}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Location with EMBEDDED MAP */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Rendezvous</h3>
                    <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden group">
                        {/* Address Bar */}
                        <div className="p-4 flex items-center gap-4 border-b border-white/5 bg-[#181818]">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(204,255,0,0.1)] shrink-0">
                                <MapPin size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-white font-bold text-sm truncate">{localQuest.location?.place_name || "Location TBD"}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wide truncate">{localQuest.location?.address_full || "Davao City"}</p>
                            </div>
                        </div>

                        {/* Embedded Map */}
                        <div className="w-full h-48 bg-gray-900 relative">
                            {localQuest.location && (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    scrolling="no"
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${localQuest.location.lng - 0.005}%2C${localQuest.location.lat - 0.005}%2C${localQuest.location.lng + 0.005}%2C${localQuest.location.lat + 0.005}&layer=mapnik&marker=${localQuest.location.lat}%2C${localQuest.location.lng}`}
                                    className="w-full h-full grayscale invert contrast-[1.1] opacity-70 hover:opacity-100 transition-opacity"
                                />
                            )}
                            <a
                                href={localQuest.location ? `https://www.google.com/maps/search/?api=1&query=${localQuest.location.lat},${localQuest.location.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(localQuest.location?.place_name || '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all flex items-center gap-1"
                            >
                                Open Maps <ArrowUpRight size={10} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Participation Block */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center pl-1">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Squad ({participants.length}/{localQuest.capacity || '∞'})</h3>
                        <div className="flex items-center gap-2">
                            <div className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${localQuest.approval_required ? 'border-primary/30 text-primary' : 'border-green-500/30 text-green-500'}`}>
                                {localQuest.approval_required ? 'Approval Required' : 'Auto-Join'}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {participants.map((p) => {
                            const isUserReady = readyIds.includes(p.id);
                            return (
                                <div key={p.id} className={`flex items-center justify-between bg-[#121212] p-3 rounded-2xl border ${isUserReady ? 'border-primary/20' : 'border-white/5'} transition-all`}>
                                    <div className="flex items-center gap-3">
                                        <img src={p.avatar_url || undefined} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                        <div>
                                            <p className="text-white font-bold text-sm">{p.username}</p>
                                            <p className={`text-[9px] font-black uppercase tracking-widest ${isUserReady ? 'text-primary' : 'text-gray-600'}`}>
                                                {isUserReady ? 'READY' : 'PREPARING'}
                                            </p>
                                        </div>
                                    </div>
                                    {isHost && p.id !== currentUser.id && (
                                        <button onClick={() => handleKick(p.id)} className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {/* Quest Memories Section */}
                    {(questCaptures.length > 0 || localQuest.status === QuestStatus.COMPLETED) && (
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between pl-1">
                                <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                    <History size={14} /> Quest Memories ({questCaptures.length})
                                </h3>
                            </div>

                            {questCaptures.length > 0 ? (
                                <div className="space-y-4">
                                    {questCaptures.map(cap => (
                                        <DualCameraPost
                                            key={cap.id}
                                            capture={cap}
                                            currentUser={currentUser}
                                            isLocked={false}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 bg-[#121212] rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center px-8">
                                    <Camera size={32} className="text-gray-600 mb-4" />
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-loose">
                                        No memories captured yet.<br />Be the first to share!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-40">
                    <div className="bg-[#1A1A1A] rounded-[2.5rem] p-2 flex items-center justify-between border border-white/10 shadow-2xl max-w-md mx-auto">
                        <div className="pl-6 flex flex-col">
                            <span className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-0.5">Aura Reward</span>
                            <span className="text-white font-black text-xl tracking-tighter uppercase">+{localQuest.aura_reward || 100}</span>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => setShowInviteModal(true)} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all">
                                <Share size={20} />
                            </button>

                            {/* Adaptive CTA */}
                            {isHost ? (
                                <div className="flex gap-2">
                                    {localQuest.status === QuestStatus.DISCOVERABLE && (
                                        <button
                                            onClick={handleProceed}
                                            className="h-12 px-8 rounded-full bg-primary text-black font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(204,255,0,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                        >
                                            <Play size={16} className="fill-current" />
                                            Start Mission
                                        </button>
                                    )}
                                    {localQuest.status === QuestStatus.ACTIVE && (
                                        <>
                                            <button
                                                onClick={() => setShowCamera(true)}
                                                className="h-12 px-8 rounded-full bg-primary text-black font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(204,255,0,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                            >
                                                <Camera size={18} />
                                                Capture
                                            </button>
                                            <button
                                                onClick={handleManualComplete}
                                                className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                                                title="Complete Quest"
                                            >
                                                <Trophy size={18} />
                                            </button>
                                        </>
                                    )}
                                    {localQuest.status === QuestStatus.COMPLETED && (
                                        <div className="h-12 px-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                            <Check size={18} />
                                            Mission Complete
                                        </div>
                                    )}
                                </div>
                            ) : isParticipant ? (
                                localQuest.status === QuestStatus.ACTIVE ? (
                                    <button
                                        onClick={handleEchoClick}
                                        className="h-12 px-8 rounded-full bg-white/10 text-white border border-white/20 font-black text-xs uppercase tracking-widest"
                                    >
                                        Active - Enter Comms
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleEchoClick}
                                            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                                            title="Squad Comms"
                                        >
                                            <MessageSquare size={18} />
                                        </button>
                                        <button
                                            onClick={toggleReady}
                                            className={`h-12 px-8 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${isReady ? 'bg-primary text-black' : 'bg-white/5 text-white border border-white/10'}`}
                                        >
                                            {isReady ? <Check size={18} strokeWidth={3} /> : <Check size={18} />}
                                            {isReady ? 'Ready' : 'Confirmed'}
                                        </button>
                                    </div>
                                )
                            ) : (
                                <div className="flex gap-2">
                                    {(localQuest.status === QuestStatus.LOBBY || localQuest.status === QuestStatus.ACTIVE) && (
                                        <button
                                            onClick={() => showNotification("Spectator Access Granted", "success")}
                                            className="h-12 px-6 rounded-full bg-white/5 text-white border border-white/10 font-bold text-xs uppercase tracking-widest hover:bg-white/10"
                                        >
                                            Spectate
                                        </button>
                                    )}
                                    <button
                                        onClick={onJoin}
                                        disabled={participants.length >= (localQuest.capacity || 99) || localQuest.status === QuestStatus.COMPLETED}
                                        className={`h-12 px-10 rounded-full font-black text-xs uppercase tracking-widest shadow-lg transition-all ${localQuest.status === QuestStatus.COMPLETED ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-primary hover:scale-105 active:scale-95'}`}
                                    >
                                        {localQuest.status === QuestStatus.COMPLETED ? 'Ended' : participants.length >= (localQuest.capacity || 99) ? 'Full' : localQuest.approval_required ? 'Request Hunt' : 'Hunt Now'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {
                showCancelModal && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
                            <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                                <AlertCircle size={32} className="text-red-500" />
                            </div>
                            <h2 className="text-2xl font-black text-white italic uppercase mb-2 tracking-tight">Abort Quest?</h2>
                            <p className="text-gray-400 text-sm mb-8">This will notify everyone. Are you sure?</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setShowCancelModal(false)} className="py-4 text-gray-500 font-bold uppercase text-xs tracking-widest">Cancel</button>
                                <button onClick={confirmCancel} className="py-4 bg-red-500 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-red-500/20">Abort</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showReasonModal && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                            <h2 className="text-xl font-black text-white italic uppercase mb-6 text-center">Reason for Cancellation</h2>
                            <div className="space-y-2 mb-8">
                                {['Change of plans', 'Bad weather', 'Not enough people', 'Other'].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setCancelReason(r)}
                                        className={`w-full p-4 rounded-2xl border text-left font-bold transition-all ${cancelReason === r ? 'bg-primary text-black border-primary' : 'bg-white/5 border-white/5 text-gray-400'}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                            <button onClick={finalizeCancel} disabled={!cancelReason || isCancelling} className="w-full py-4 bg-red-500 rounded-2xl text-white font-black uppercase tracking-widest shadow-lg disabled:opacity-50">
                                {isCancelling ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                )
            }

            {
                showReviewModal && (
                    <SquadReviewModal
                        participants={participants}
                        currentUser={currentUser}
                        questId={localQuest.id}
                        onClose={() => { setShowReviewModal(false); onClose(); }}
                        onSubmit={() => { setShowReviewModal(false); showNotification("Vibes Submitted!", "success"); setTimeout(onClose, 2000); }}
                    />
                )
            }

            {
                showCamera && (
                    <CameraFlow
                        currentUser={currentUser}
                        questId={localQuest.id}
                        onClose={() => setShowCamera(false)}
                        onPost={handleQuestCaptured}
                    />
                )
            }

            {
                showInviteModal && (
                    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300" onClick={() => setShowInviteModal(false)}>
                        <div className="bg-[#121212] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-sm flex flex-col max-h-[85vh] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Invite Spots</h2>
                                <button onClick={() => setShowInviteModal(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {OTHER_USERS.map(friend => {
                                    const isInvited = invitedIds.includes(friend.id);
                                    return (
                                        <div key={friend.id} className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                            <div className="flex items-center gap-3">
                                                <img src={friend.avatar_url} className="w-10 h-10 rounded-full object-cover grayscale opacity-70" />
                                                <div>
                                                    <p className="text-white font-bold text-sm">{friend.username}</p>
                                                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Lvl {friend.level}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (isInvited) return;
                                                    setInvitedIds(prev => [...prev, friend.id]);
                                                    showNotification(`Invite sent to ${friend.username}!`, 'success');
                                                }}
                                                className={`h-8 px-4 rounded-full text-[10px] font-black uppercase transition-all ${isInvited ? 'bg-white/10 text-gray-500 cursor-not-allowed' : 'bg-primary text-black hover:scale-105 active:scale-95'}`}
                                            >
                                                {isInvited ? 'Sent' : 'Invite'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">External Share</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const shareUrl = `https://be4l.app/quest/${localQuest.id}`;
                                            navigator.clipboard.writeText(shareUrl);
                                            showNotification("Link copied to clipboard!", "success");
                                        }}
                                        className="flex-1 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-white font-bold hover:bg-white/10 transition-all"
                                    >
                                        <Copy size={18} />
                                        <span className="text-xs">Copy Quest Link</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const shareUrl = `https://be4l.app/quest/${localQuest.id}`;
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: localQuest.title,
                                                    text: localQuest.description,
                                                    url: shareUrl
                                                }).catch(() => { });
                                            } else {
                                                showNotification("Sharing not supported", "error");
                                            }
                                        }}
                                        className="w-12 h-12 bg-primary text-black rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6">
                                <GradientButton fullWidth onClick={() => setShowInviteModal(false)}>
                                    Done
                                </GradientButton>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default QuestDetailsScreen;
