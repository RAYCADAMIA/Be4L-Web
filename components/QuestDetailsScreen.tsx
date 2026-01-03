import React, { useState, useEffect } from 'react';
import { Clock, MapPin, MessageSquare, ChevronLeft, User as UserIcon, Trash2, Edit2, Check, X, Share, LogOut, Wallet, Bell, AlertCircle, Send, Play } from 'lucide-react';
import { Quest, QuestStatus, User } from '../types';
import { MOCK_USER, OTHER_USERS, COLORS } from '../constants';
import { supabaseService } from '../services/supabaseService';
import ProfileScreen from './ProfileScreen';

interface QuestDetailsScreenProps {
    quest: Quest;
    onClose: () => void;
    onJoin: () => void;
}

const QuestDetailsScreen: React.FC<QuestDetailsScreenProps> = ({ quest, onClose, onJoin }) => {
    const isHost = quest.host_id === MOCK_USER.id;
    // Current state management for immediate UI updates
    const [localQuest, setLocalQuest] = useState<Quest>(quest);
    const participants = localQuest.participants || (localQuest.host ? [localQuest.host] : []);
    const isParticipant = participants.some(p => p.id === MOCK_USER.id);
    const readyIds = localQuest.ready_ids || [];
    const isReady = readyIds.includes(MOCK_USER.id);

    // Profile Modal
    const [viewingProfile, setViewingProfile] = useState<User | null>(null);

    // Cancellation Modal State
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    // Mock Join Requests (Only visible to host)
    const [joinRequests, setJoinRequests] = useState(
        isHost ? [
            { id: 'u-req-1', user: OTHER_USERS[0], status: 'pending' },
            { id: 'u-req-2', user: OTHER_USERS[1], status: 'pending' },
        ] : []
    );

    // Notifications
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

    const handleBack = () => {
        if (viewingProfile) {
            setViewingProfile(null);
        } else {
            onClose();
        }
    };

    // --- Host Actions ---

    // 1. Kick Participant
    const handleKick = async (userId: string) => {
        if (window.confirm("Kick this user from the quest?")) {
            const success = await supabaseService.quests.kickParticipant(localQuest.id, userId);
            if (success) {
                // Update local state
                setLocalQuest(prev => ({
                    ...prev,
                    participants: prev.participants?.filter(p => p.id !== userId),
                    ready_ids: prev.ready_ids?.filter(id => id !== userId)
                }));
                showNotification("User kicked.", "success");
            }
        }
    };

    // 2. Cancel Quest Flow
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

    // 3. Edit Details
    const handleEdit = () => {
        showNotification("Edit feature coming soon!", "info");
    };

    // 4. Proceed To Quest
    const handleProceed = async () => {
        const notReadyCount = participants.filter(p => !(localQuest.ready_ids || []).includes(p.id)).length;
        if (notReadyCount > 0) {
            if (!confirm(`${notReadyCount} participant(s) aren't ready yet. Proceed anyway?`)) return;
        }

        await supabaseService.quests.proceedToQuest(localQuest.id);
        showNotification("Quest Started!", "success");
        setTimeout(onClose, 1000);
    };


    // --- Participant Actions ---

    // Toggle Ready
    const toggleReady = async () => {
        await supabaseService.quests.toggleReadyStatus(localQuest.id, MOCK_USER.id);
        setLocalQuest(prev => {
            const currentReady = prev.ready_ids || [];
            const isNowReady = !currentReady.includes(MOCK_USER.id);
            return {
                ...prev,
                ready_ids: isNowReady ? [...currentReady, MOCK_USER.id] : currentReady.filter(id => id !== MOCK_USER.id)
            };
        });
        showNotification(isReady ? "Set to Not Ready" : "Set to Ready!", "success");
    };

    const handleAcceptRequest = (reqId: string) => {
        setJoinRequests(prev => prev.filter(r => r.id !== reqId));
        alert("User accepted into quest!");
    };

    const handleDeclineRequest = (reqId: string) => {
        setJoinRequests(prev => prev.filter(r => r.id !== reqId));
    };

    const handleInvite = () => {
        alert("Invite friends feature coming soon!");
    };

    const handleLeave = () => {
        if (confirm("Are you sure you want to leave this quest?")) {
            onClose();
        }
    };

    if (viewingProfile) {
        return (
            <ProfileScreen
                user={viewingProfile}
                onBack={() => setViewingProfile(null)}
                // Minimal props for preview
                onLogout={() => { }} onOpenPostDetail={() => { }} onOpenMyQuests={() => { }} onOpenUser={() => { }} onProfileUpdate={() => { }}
            />
        );
    }

    return (
        <div className="absolute inset-0 z-[60] bg-black flex flex-col animate-in slide-in-from-bottom duration-300 safe-area-bottom overflow-y-auto font-sans">

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-12 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-[70] flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${notification.type === 'error' ? 'bg-red-500 text-white' : notification.type === 'success' ? 'bg-green-500 text-black' : 'bg-surface text-white border border-white/20'}`}>
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
                    {isHost && (
                        <div className="flex gap-2">
                            <button onClick={handleEdit} className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/20 transition-all">
                                <Edit2 size={20} />
                            </button>
                            <button onClick={initiateCancel} className="p-2 bg-red-500/20 backdrop-blur-md rounded-full text-red-500 border border-red-500/30 hover:bg-red-500/40 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Title & Tags */}
                <div className="absolute bottom-4 left-6 right-6">
                    <div className="flex gap-2 mb-3">
                        <span className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black text-white uppercase border border-white/10 tracking-[0.1em] shadow-sm">
                            {localQuest.category}
                        </span>
                        <span className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black text-white uppercase border border-white/10 tracking-[0.1em] shadow-sm">
                            {localQuest.activity || 'General'}
                        </span>
                        <span className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black text-gray-400 uppercase border border-white/10 tracking-[0.1em] shadow-sm">
                            {localQuest.type}
                        </span>
                        {isHost && (
                            <span className="bg-primary backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black text-black uppercase border border-primary tracking-[0.1em] shadow-[0_0_10px_rgba(204,255,0,0.4)]">
                                Host Mode
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter shadow-lg leading-[0.9] drop-shadow-lg max-w-[90%]">
                        {localQuest.title}
                    </h1>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 px-5 pb-40 space-y-8 bg-black">

                {/* Host Controls: Pending Requests */}
                {isHost && (
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 shadow-lg overflow-hidden relative">
                        {/* Glow Effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                <UserIcon size={14} /> Pending Requests ({joinRequests.length})
                            </h3>
                        </div>
                        {joinRequests.length > 0 ? (
                            <div className="space-y-3">
                                {joinRequests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between bg-surface/50 p-3 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <img src={req.user.avatar_url} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                            <div>
                                                <p className="text-white font-bold text-sm">{req.user.username}</p>
                                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Wants to join</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleDeclineRequest(req.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                                <X size={14} />
                                            </button>
                                            <button onClick={() => handleAcceptRequest(req.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-black hover:bg-lime-400 transition-colors shadow-[0_0_10px_rgba(204,255,0,0.2)]">
                                                <Check size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-600 text-xs italic">No pending requests</div>
                        )}
                    </div>
                )}

                {/* Time & Date Blocks */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1A1A1A] border border-white/5 p-4 rounded-xl flex flex-col justify-between h-24 relative overflow-hidden group">
                        <div className="absolute right-[-10px] top-[-10px] w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all"></div>
                        <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center mb-2 text-primary">
                            <Clock size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Time</p>
                            <p className="text-white font-black text-sm uppercase tracking-tight">
                                {new Date(localQuest.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <div className="bg-[#1A1A1A] border border-white/5 p-4 rounded-xl flex flex-col justify-between h-24 relative overflow-hidden group">
                        <div className="absolute right-[-10px] top-[-10px] w-16 h-16 bg-green-500/5 rounded-full blur-xl group-hover:bg-green-500/10 transition-all"></div>
                        <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center mb-2 text-green-500">
                            <Clock size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Date</p>
                            <p className="text-white font-black text-sm uppercase tracking-tight">
                                {new Date(localQuest.start_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Host Info */}
                <div
                    className="bg-[#121212] border border-white/5 p-1 rounded-2xl flex items-center justify-between pr-4 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setViewingProfile(localQuest.host)}
                >
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img src={localQuest.host?.avatar_url || 'https://picsum.photos/100/100?random=1'} className="w-14 h-14 rounded-xl object-cover border border-white/5" />
                            <div className="absolute -bottom-2 -right-2 bg-surface rounded-lg p-1 border border-black shadow-sm">
                                <div className="bg-gray-800 px-1.5 py-0.5 rounded text-[8px] font-black text-white flex items-center gap-0.5">
                                    🔥 <span>{localQuest.host?.streak_count || 0}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Hosted By</span>
                            <span className="text-white font-black text-lg tracking-tight leading-none">{localQuest.host?.username || 'Unknown'}</span>
                        </div>
                    </div>
                    {!isHost && (
                        <button className="px-4 py-2 rounded-lg bg-surface border border-white/10 text-xs font-bold text-white hover:bg-white/5 transition-colors" onClick={(e) => {
                            e.stopPropagation();
                            showNotification("Chat feature coming soon!", 'error');
                        }}>
                            Message
                        </button>
                    )}
                </div>

                {/* About Section */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">The Plan</h3>
                    <p className="text-gray-300 text-base font-medium leading-relaxed italic border-l-2 border-primary/50 pl-4 py-1">
                        "{localQuest.description || "No description provided."}"
                    </p>
                </div>

                {/* Ideal Companions Section */}
                <div className="space-y-2">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Ideal Companions</h3>
                    <div className="bg-[#111] border border-white/5 border-dashed rounded-xl p-4">
                        <p className="text-primary font-bold italic text-sm tracking-wide">
                            "{localQuest.ideal_match_criteria || "Open to everyone!"}"
                        </p>
                    </div>
                </div>

                {/* Location Section */}
                <div className="space-y-2">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Location</h3>
                    <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary border border-white/5">
                            <MapPin size={18} />
                        </div>
                        <span className="text-white font-bold text-sm tracking-wide">{localQuest.location || "Location to be announced"}</span>
                    </div>
                </div>

                {/* Participants List */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1 flex justify-between items-center">
                        <span>Participants</span>
                        <span className="bg-surface px-2 py-0.5 rounded text-[10px] text-white border border-white/5">{participants.length}/{localQuest.max_participants}</span>
                    </h3>

                    <div className="space-y-2">
                        {participants.map((p, i) => {
                            const isUserReady = (localQuest.ready_ids || []).includes(p.id);
                            return (
                                <div key={i} className={`flex items-center justify-between bg-[#111] p-3 rounded-xl border ${isUserReady ? 'border-primary/30' : 'border-white/5'} transition-colors`}>
                                    <div className="flex items-center gap-3">
                                        <img src={p.avatar_url} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-white font-bold text-sm">{p.username}</p>
                                                {p.id === localQuest.host_id && <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase">Host</span>}
                                            </div>
                                            <p className={`text-[10px] font-bold uppercase tracking-wider ${isUserReady ? 'text-primary' : 'text-gray-600'}`}>
                                                {isUserReady ? 'READY' : 'Waiting...'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,255,0,0.5)] ${isUserReady ? 'bg-primary' : 'bg-gray-800'}`}></div>
                                        {isHost && p.id !== MOCK_USER.id && (
                                            <button onClick={() => handleKick(p.id)} className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {/* Open Slots */}
                        {Array.from({ length: Math.max(0, localQuest.max_participants - participants.length) }).slice(0, 3).map((_, i) => (
                            <div key={`empty-${i}`} className="flex items-center justify-between bg-transparent p-3 rounded-xl border border-white/5 border-dashed opacity-50">
                                <span className="text-gray-600 text-xs font-bold uppercase tracking-wider italic">Open Slot</span>
                                <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-gray-600">
                                    <UserIcon size={12} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Bottom Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-[#000000] border-t border-white/10 z-20 pb-8 safe-area-bottom">
                <div className="bg-[#1A1A1A] rounded-[2rem] p-2 flex items-center justify-between border border-white/10 shadow-2xl">

                    {/* Fee Display */}
                    <div className="pl-5 pr-4 flex flex-col justify-center">
                        <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Expected Fee</span>
                        <div className="flex items-center gap-1">
                            <span className="text-white font-black text-xl tracking-tighter">₱{localQuest.fee}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button onClick={handleInvite} className="h-12 px-5 rounded-full bg-surface border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-all flex items-center gap-2">
                            <Share size={16} />
                            Invite
                        </button>

                        {isHost ? (
                            <button
                                onClick={handleProceed}
                                className="h-12 px-6 rounded-full bg-primary text-black font-black text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(204,255,0,0.4)] hover:bg-lime-400 transition-all flex items-center gap-2"
                            >
                                <Play size={16} fill="black" />
                                Proceed
                            </button>
                        ) : isParticipant ? (
                            <button
                                onClick={toggleReady}
                                className={`h-12 px-6 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${isReady ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-gray-800 text-white'}`}
                            >
                                {isReady ? <Check size={16} /> : <AlertCircle size={16} />}
                                {isReady ? 'Ready' : 'Not Ready'}
                            </button>
                        ) : (
                            <button
                                onClick={onJoin}
                                disabled={participants.length >= localQuest.max_participants}
                                className={`h-12 px-8 rounded-full font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all ${participants.length >= localQuest.max_participants ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-primary text-black hover:bg-lime-400 hover:scale-105'}`}
                            >
                                {participants.length >= localQuest.max_participants ? 'Full' : 'Join'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel Quest Modal 1: Confirmation */}
            {showCancelModal && (
                <div className="absolute inset-0 z-[80] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#121212] border border-red-500/30 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                            <AlertCircle size={32} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white italic uppercase mb-2">Cancel Quest?</h2>
                        <p className="text-gray-400 text-sm mb-6">Are you sure you want to cancel? This will notify all participants.</p>

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setShowCancelModal(false)} className="py-3 rounded-xl bg-surface border border-white/10 text-white font-bold uppercase tracking-wider hover:bg-white/10">
                                Nevermind
                            </button>
                            <button onClick={confirmCancel} className="py-3 rounded-xl bg-red-500 text-black font-bold uppercase tracking-wider hover:bg-red-400">
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Quest Modal 2: Reason */}
            {showReasonModal && (
                <div className="absolute inset-0 z-[80] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                        <h2 className="text-xl font-black text-white italic uppercase mb-4 text-center">Why cancel?</h2>

                        <div className="space-y-2 mb-6">
                            {['Change of Plans', 'Bad Weather', 'Emergency', 'Not Enough People', 'Other'].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setCancelReason(r)}
                                    className={`w-full p-4 rounded-xl border text-left font-bold transition-all text-sm ${cancelReason === r ? 'bg-primary text-black border-primary' : 'bg-surface text-gray-400 border-white/5 hover:border-white/20'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={finalizeCancel}
                            disabled={!cancelReason || isCancelling}
                            className="w-full py-4 rounded-xl bg-red-500 text-black font-black uppercase tracking-wider hover:bg-red-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestDetailsScreen;
