import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Users, Zap, Calendar, Shield, Share2, MessageCircle, ArrowRight, Check, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseService } from '../../services/supabaseService';
import { Quest, QuestStatus } from '../../types';
import { EKGLoader } from '../ui/AestheticComponents';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Toast';

const QuestDetailScreen: React.FC = () => {
    const { questId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [quest, setQuest] = useState<Quest | null>(null);
    const [loading, setLoading] = useState(true);
    const [joinState, setJoinState] = useState<'idle' | 'requested' | 'joined'>('idle');

    useEffect(() => {
        const loadQuest = async () => {
            setLoading(true);
            const { data } = await supabaseService.quests.getQuestById(questId || '');
            if (data) {
                setQuest(data);
            } else {
                setQuest({
                    id: questId || 'demo-quest',
                    title: 'Davao Night Market Hunt',
                    description: 'Join the squad to find the best street food spots. Earn Aura points for every verified capture.',
                    image_url: 'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=1000&auto=format&fit=crop',
                    location: { place_id: '1', place_name: 'Roxas Ave, Davao City' },
                    category: 'Social',
                    host: { id: 'host-1', username: 'NightHunter', avatar_url: 'https://i.pravatar.cc/150?u=a' },
                    current_participants: 12,
                    max_participants: 20,
                    status: QuestStatus.DISCOVERABLE,
                    start_time: new Date().toISOString(),
                    mode: 'canon' as any,
                    approval_required: true
                } as any);
            }
            setLoading(false);
        };
        loadQuest();
    }, [questId]);

    const handleJoinAction = () => {
        if (joinState === 'joined') {
            navigate('/app/chat', {
                state: {
                    openChatId: `lobby-${questId}`,
                    openChatName: quest?.title || 'Group Chat'
                }
            });
        } else if (joinState === 'idle') {
            if (quest?.approval_required) {
                setJoinState('requested');
                showToast("Join request sent! Waiting for host approval.", "info");

                // Simulate approval for MVP
                setTimeout(() => {
                    setJoinState('joined');
                    showToast("You've been approved! You can now join the chat.", "success");
                }, 3000);
            } else {
                setJoinState('joined');
                showToast("Joined! Welcome to the squad.", "success");
            }
        }
    };

    const handleFinishQuest = async () => {
        if (!questId) return;
        if (window.confirm("Ready to finish this activity and award points to all participants?")) {
            showToast("Processing quest rewards...", "info");
            const { success } = await supabaseService.quests.finishQuest(questId);
            if (success) {
                showToast("Quest Completed! Aura points awarded.", "success");
                navigate('/app/quests');
            } else {
                showToast("Failed to close activity.", "error");
            }
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-deep-black"><EKGLoader /></div>;
    if (!quest) return <div className="h-screen flex items-center justify-center text-gray-500 font-black uppercase">Quest not found</div>;

    const isHost = user?.id === quest.host?.id;
    const isLive = quest.status === QuestStatus.ACTIVE;

    return (
        <div className="min-h-screen bg-deep-black text-white relative overflow-x-hidden pb-32">
            {/* Header / Simplified Banner */}
            <div className="relative pt-32 pb-16 px-8 border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-12 left-6 z-20 p-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="px-3 py-1 rounded-full bg-primary text-black text-[10px] font-black uppercase tracking-widest">
                            {quest.category}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-300 uppercase tracking-widest bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                            <Users size={12} className="text-primary" />
                            {quest.current_participants}/{quest.max_participants || '∞'} JOINED
                        </span>
                        {isLive && (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 animate-pulse">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> LIVE NOW
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white mb-4 leading-none">
                        {quest.title}
                    </h1>
                    <div className="w-20 h-1.5 bg-primary rounded-full" />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Details Section */}
                <div className="md:col-span-2 space-y-10">
                    <section>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-4">Info & Goal</h3>
                        <p className="text-lg text-gray-300 leading-relaxed font-medium">
                            {quest.description}
                        </p>
                    </section>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group">
                            <MapPin className="text-primary mb-3 group-hover:scale-110 transition-transform" size={24} />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Meetup At</h4>
                            <p className="text-sm font-bold text-white">{quest.location?.place_name || 'Davao City, PH'}</p>
                        </div>
                        <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group">
                            <Calendar className="text-primary mb-3 group-hover:scale-110 transition-transform" size={24} />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Starts At</h4>
                            <p className="text-sm font-bold text-white">
                                {new Date(quest.start_time).toLocaleDateString()} @ {new Date(quest.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>

                    <section className="pt-6 border-t border-white/5">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6">The Squad</h3>
                        <div className="flex items-center gap-4">
                            <div
                                className="relative cursor-pointer group"
                                onClick={() => navigate(`?profile=${quest.host?.id || 'host-1'}`)}
                            >
                                <img
                                    src={quest.host?.avatar_url}
                                    className="w-12 h-12 rounded-2xl border border-white/20 object-cover group-hover:border-primary/50 transition-all"
                                    alt="host"
                                />
                                <div className="absolute -bottom-1 -right-1 p-1 bg-primary rounded-lg border-2 border-deep-black group-hover:scale-110 transition-transform">
                                    <Shield size={10} className="text-black" />
                                </div>
                            </div>
                            <div className="cursor-pointer" onClick={() => navigate(`?profile=${quest.host?.id || 'host-1'}`)}>
                                <p className="text-xs font-black uppercase tracking-widest text-white hover:text-primary transition-colors animate-liquid-text italic">{quest.host?.username}</p>
                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Activity Host</p>
                            </div>
                            <div className="ml-auto flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div
                                        key={i}
                                        onClick={() => navigate(`?profile=p-${i}`)}
                                        className="w-8 h-8 rounded-xl bg-gray-800 border-2 border-deep-black overflow-hidden hover:z-10 transition-all cursor-pointer hover:-translate-y-1"
                                    >
                                        <img src={`https://i.pravatar.cc/100?u=${i + (questId || 'q')}`} />
                                    </div>
                                ))}
                                <div className="w-8 h-8 rounded-xl bg-white/5 border-2 border-deep-black flex items-center justify-center text-[10px] font-black text-gray-500">
                                    +8
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-2xl sticky top-32">
                        <div className="text-center mb-8">
                            <Zap className="mx-auto text-primary mb-2" size={32} />
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Activity Settings</h3>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-gray-500 font-bold">Reward Potential</span>
                                <span className="text-primary font-black animate-liquid-text italic">+{quest.aura_reward || 50} Aura</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    className="h-full bg-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleJoinAction}
                                className={`
                                    w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 font-black uppercase italic
                                    ${joinState === 'idle' ? 'bg-white text-black shadow-lg hover:shadow-white/10' : ''}
                                    ${joinState === 'requested' ? 'bg-white/5 border border-white/10 text-gray-500' : ''}
                                    ${joinState === 'joined' ? 'bg-primary text-black' : ''}
                                `}
                            >
                                {joinState === 'idle' && (
                                    <>
                                        JOIN QUEST <ArrowRight size={18} />
                                    </>
                                )}
                                {joinState === 'requested' && (
                                    <>
                                        <EKGLoader size={16} /> REQUESTED
                                    </>
                                )}
                                {joinState === 'joined' && (
                                    <>
                                        <MessageCircle size={18} /> OPEN CHAT
                                    </>
                                )}
                            </button>

                            {isHost && (
                                <button
                                    onClick={handleFinishQuest}
                                    className="w-full py-4 rounded-2xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all font-black uppercase italic flex items-center justify-center gap-3"
                                >
                                    <Trophy size={18} /> FINISH QUEST
                                </button>
                            )}
                        </div>

                        <p className="text-[9px] text-center text-gray-600 font-bold uppercase tracking-[0.15em] mt-4">
                            {joinState === 'idle' && "Request to join the official group chat."}
                            {joinState === 'requested' && "Awaiting approval from the host."}
                            {joinState === 'joined' && "You are part of the squad! Coordinate below."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestDetailScreen;
