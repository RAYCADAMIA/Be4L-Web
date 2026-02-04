import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Zap, MessageCircle, ArrowRight, Trophy, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseService } from '../../services/supabaseService';
import { Quest, QuestStatus } from '../../types';
import { EKGLoader } from '../ui/AestheticComponents';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Toast';

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
                } else {
                    // Mock fallback for development if ID is not in DB or is demo
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
                        host: { id: 'host-1', username: 'System', avatar_url: '' }
                    } as any);
                }
            } catch (err) {
                console.error("Failed to load quest:", err);
            } finally {
                setLoading(false);
            }
        };
        loadQuest();
    }, [questId]);

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
                        className="relative w-full max-w-[440px] bg-deep-black border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
                    >
                        {loading ? (
                            <div className="p-20 flex justify-center"><EKGLoader /></div>
                        ) : quest ? (
                            <>
                                {/* Header */}
                                <div className="p-6 md:p-8 pb-4 flex justify-between items-start">
                                    <div className="space-y-1 pr-8">
                                        <div className="flex gap-2 mb-2">
                                            <span className="px-2 py-0.5 rounded-full bg-primary/5 text-primary text-[7px] font-black uppercase tracking-[0.2em] border border-primary/10">
                                                {quest.category}
                                            </span>
                                            {isLive && (
                                                <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[7px] font-black uppercase tracking-[0.2em] border border-red-500/20 animate-pulse">
                                                    Live Now
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-xl font-bold tracking-tight text-white leading-tight">
                                            {quest.title}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all hover:bg-white/10 shrink-0"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-6">
                                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed opacity-60">
                                        {quest.description}
                                    </p>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={10} className="text-primary/50" />
                                                <span className="text-[7px] font-black uppercase text-gray-600 tracking-widest">Avenue</span>
                                            </div>
                                            <span className="text-[10px] font-semibold text-gray-300 truncate">{quest.location?.place_name || 'Global'}</span>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <Users size={10} className="text-primary/50" />
                                                <span className="text-[7px] font-black uppercase text-gray-600 tracking-widest">Members</span>
                                            </div>
                                            <span className="text-[10px] font-semibold text-gray-300 uppercase">{quest.current_participants}/{quest.max_participants || '∞'} Enrolled</span>
                                        </div>
                                    </div>

                                    {/* Rewards / Host Footer */}
                                    <div className="flex items-center justify-between py-4 border-y border-white/5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="relative">
                                                <img
                                                    src={quest.host?.avatar_url || `https://ui-avatars.com/api/?name=${quest.host?.username || 'U'}&background=random`}
                                                    className="w-7 h-7 rounded-full border border-white/10 object-cover"
                                                />
                                                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full border border-deep-black" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-white/80">{quest.host?.username || 'Host'}</span>
                                                <span className="text-[7px] font-bold text-gray-600 uppercase tracking-widest">Founder</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-0.5">
                                            <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Reward Potential</span>
                                            <div className="flex items-center gap-1.5">
                                                <Zap size={10} className="text-primary" />
                                                <span className="text-[11px] font-black tracking-tight text-primary">+{quest.aura_reward || 0} AURA</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        <motion.button
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleJoinAction}
                                            className={`
                                                w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-semibold uppercase text-[10px] tracking-[0.2em] shadow-2xl
                                                ${joinState === 'idle' ? 'bg-white text-black hover:bg-primary transition-colors' : ''}
                                                ${joinState === 'requested' ? 'bg-white/5 border border-white/10 text-gray-600 pointer-events-none' : ''}
                                                ${joinState === 'joined' ? 'bg-primary text-black shadow-primary/20 shadow-lg' : ''}
                                            `}
                                        >
                                            {joinState === 'idle' && <>Secure Spot <ArrowRight size={14} /></>}
                                            {joinState === 'requested' && <>Authenticating...</>}
                                            {joinState === 'joined' && <><MessageCircle size={14} /> Enter Lobby</>}
                                        </motion.button>

                                        {isHost && (
                                            <button
                                                onClick={handleFinishQuest}
                                                className="w-full py-3.5 rounded-2xl border border-primary/10 bg-primary/[0.02] text-primary/40 hover:text-primary hover:bg-primary/5 transition-all font-semibold uppercase text-[9px] tracking-[0.2em] flex items-center justify-center gap-3"
                                            >
                                                <Trophy size={14} /> Conclude Quest
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-20 text-center text-gray-600 uppercase font-black text-[10px] tracking-widest">Quest Void</div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default QuestOverlay;
