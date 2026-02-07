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

const QuestDetailScreen: React.FC = () => {
    const { questId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [quest, setQuest] = useState<Quest | null>(null);

    useDocumentTitle(quest ? quest.title : 'Quest Details');
    const [loading, setLoading] = useState(true);
    const [joinState, setJoinState] = useState<'idle' | 'requested' | 'joined'>('idle');
    const [activeTab, setActiveTab] = useState<'details' | 'itinerary' | 'checklist'>('details');
    const [participants, setParticipants] = useState<any[]>([]);
    const [managingSquad, setManagingSquad] = useState(false);

    useEffect(() => {
        const loadQuest = async () => {
            setLoading(true);
            const { data } = await supabaseService.quests.getQuestById(questId || '');
            if (data) {
                setQuest(data);
                if (user && data.participant_ids?.includes(user.id)) {
                    setJoinState('joined');
                }
                const parts = await supabaseService.quests.getQuestParticipants(questId || '');
                setParticipants(parts);
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

    const handleDeleteQuest = async () => {
        if (!questId) return;
        if (window.confirm("Are you sure you want to cancel this quest? This cannot be undone.")) {
            const success = await supabaseService.quests.cancelQuest(questId);
            if (success) {
                showToast("Quest cancelled.", "info");
                navigate('/app/quests');
            } else {
                showToast("Failed to cancel quest.", "error");
            }
        }
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

    const handleKickParticipant = async (uid: string) => {
        if (!questId) return;
        if (window.confirm("Remove this user from the squad?")) {
            const success = await supabaseService.quests.removeQuestParticipant(questId, uid);
            if (success) {
                setParticipants(prev => prev.filter(p => p.id !== uid));
                showToast("User removed.", "info");
            } else {
                showToast("Failed to remove user.", "error");
            }
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-deep-black"><EKGLoader /></div>;
    if (!quest) return <div className="h-screen flex items-center justify-center text-gray-500 font-black uppercase tracking-[0.2em]">Quest not found</div>;

    const isHost = user?.id === quest.host?.id;
    const isLive = quest.status === QuestStatus.ACTIVE;

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
                        <div className="flex items-center gap-3 bg-white/5 p-2 pr-6 rounded-2xl border border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
                            <div className="relative">
                                <img
                                    src={quest.host?.avatar_url || `https://ui-avatars.com/api/?name=${quest.host?.username}`}
                                    className="w-10 h-10 rounded-xl border border-white/10 object-cover group-hover:border-primary/40 transition-all"
                                    alt="host"
                                />
                                <div className="absolute -bottom-1 -right-1 p-1 bg-primary rounded-lg border-2 border-deep-black">
                                    <Shield size={10} className="text-black" />
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-primary transition-colors animate-liquid-text">
                                    {quest.host?.username || "Quest Host"}
                                </p>
                                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em]">Mission Lead</p>
                            </div>
                        </div>

                        {quest.vibe_signals && quest.vibe_signals.length > 0 && (
                            <div className="hidden md:flex flex-wrap gap-2">
                                {quest.vibe_signals.map((signal, i) => (
                                    <span key={i} className="text-[9px] font-black uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
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
                            { id: 'details', label: 'Briefing' },
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
                                        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group backdrop-blur-3xl">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform">
                                                <MapPin className="text-primary" size={24} />
                                            </div>
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">TARGET LOCATION</h4>
                                            <p className="text-lg font-black text-white leading-tight">{quest.location?.place_name || 'Davao City, PH'}</p>
                                        </div>
                                        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group backdrop-blur-3xl">
                                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                                                <Calendar className="text-purple-400" size={24} />
                                            </div>
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">MISSION START</h4>
                                            <p className="text-lg font-black text-white leading-tight">
                                                {new Date(quest.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} @ {new Date(quest.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Map Preview */}
                                    <div className="rounded-[3rem] overflow-hidden border border-white/10 bg-zinc-900/50 relative h-80 group shadow-2xl">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />
                                        <SmartMap
                                            mode="view"
                                            initialLocation={quest.location ? {
                                                lat: quest.location.lat,
                                                lng: quest.location.lng,
                                                placeName: quest.location.place_name,
                                                formattedAddress: quest.location.address_full
                                            } : undefined}
                                            height="100%"
                                        />
                                        <div className="absolute bottom-6 left-6 z-20">
                                            <button className="bg-white text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-primary transition-all active:scale-95">
                                                <Navigation size={14} /> GET DIRECTIONS
                                            </button>
                                        </div>
                                    </div>

                                    {/* Squad Section */}
                                    <section className="pt-12 border-t border-white/5">
                                        <div className="flex items-center justify-between mb-10">
                                            <div className="space-y-1">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">CONFIRMED SQUAD</h3>
                                                <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">{participants.length} Active Participants</p>
                                            </div>
                                            {isHost && participants.length > 0 && (
                                                <button
                                                    onClick={() => setManagingSquad(!managingSquad)}
                                                    className={`text-[9px] font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl border transition-all ${managingSquad ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-white/5 text-gray-500 border-white/10 hover:text-white hover:bg-white/10'}`}
                                                >
                                                    {managingSquad ? 'CLOSE MANAGEMENT' : 'MANAGE SQUAD'}
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {participants.map((p, pIdx) => (
                                                <motion.div
                                                    key={p.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: pIdx * 0.1 }}
                                                    className="flex items-center justify-between p-4 rounded-[2rem] bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-4" onClick={() => navigate(`?profile=${p.id}`)}>
                                                        <div className="relative">
                                                            <img src={p.avatar_url || `https://ui-avatars.com/api/?name=${p.username}`} className="w-12 h-12 rounded-2xl object-cover border border-white/10 group-hover:border-primary/30 transition-all" />
                                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-lg border-2 border-deep-black" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black uppercase tracking-wider text-gray-400 group-hover:text-white transition-colors">{p.username}</p>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <div className="w-1 h-1 rounded-full bg-primary/60" />
                                                                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Lv. {Math.floor(Math.random() * 10) + 1}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {managingSquad && isHost && (
                                                        <button
                                                            onClick={() => handleKickParticipant(p.id)}
                                                            className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                                        >
                                                            <Trash size={16} />
                                                        </button>
                                                    )}
                                                </motion.div>
                                            ))}
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
                                        <p className="text-sm text-gray-500 uppercase font-bold tracking-widest">Follow the sequence for maximum Aura rewards</p>
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
                                <h3 className="text-lg font-black uppercase tracking-widest text-white"> briefing</h3>
                                <Zap className="text-primary group-hover:animate-bounce" size={24} />
                            </div>

                            <div className="space-y-8 mb-12">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                                        <span className="text-gray-500">POTENTIAL LOOT</span>
                                        <span className="text-primary animate-liquid-text">+{quest.aura_reward || 100} EXP</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-primary to-emerald-400 shadow-[0_0_20px_rgba(45,212,191,0.4)]"
                                        />
                                    </div>
                                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest italic text-center">Final reward based on activity verification</p>
                                </div>

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
                                    <button
                                        onClick={handleJoinAction}
                                        className={`
                                             w-full py-5 rounded-[2rem] flex items-center justify-center gap-4 transition-all active:scale-95 font-black uppercase tracking-widest text-xs overflow-hidden relative
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
                                                    Request to Join <ArrowRight size={18} />
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
                                                    <EKGLoader size={16} /> WAITING FOR HOST
                                                </motion.div>
                                            )}
                                            {joinState === 'joined' && (
                                                <motion.div
                                                    key="joined"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="flex items-center gap-3"
                                                >
                                                    <MessageCircle size={18} /> Open Comms
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                ) : (
                                    <div className="space-y-4 pt-6 border-t border-white/10">
                                        {!isLive ? (
                                            <button
                                                onClick={handleStartQuest}
                                                className="w-full py-5 rounded-[2rem] bg-electric-teal text-black hover:bg-white shadow-xl shadow-electric-teal/10 transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                                            >
                                                <Play size={18} fill="black" /> INITIATE MISSION
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleFinishQuest}
                                                className="w-full py-5 rounded-[2rem] border-2 border-primary bg-primary text-black hover:bg-white transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                                            >
                                                <Trophy size={18} /> EXTRACT & AWARD
                                            </button>
                                        )}

                                        <button
                                            onClick={handleDeleteQuest}
                                            className="w-full py-4 rounded-[2rem] bg-white/5 text-gray-500 border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500 transition-all font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                                        >
                                            <Trash size={14} /> SCRUB MISSION
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <p className="text-[8px] text-center text-gray-600 font-bold uppercase tracking-[0.2em] leading-relaxed">
                                    {isHost ? "You are the mission lead. Coordinate your squad through the lobby chat and verify completion to distribute rewards." :
                                        (joinState === 'idle' ? "Join the squad to receive a private lobby link and earn exclusive Aura rewards." :
                                            joinState === 'requested' ? "Your request is being reviewed by the mission lead. You'll be notified of approval." :
                                                "You are officially part of the mission. Use the lobby link to coordinate in real-time.")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestDetailScreen;
