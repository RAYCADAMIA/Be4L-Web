import React from 'react';
import { MapPin, Users, Clock, ArrowRight, Globe, Signal, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Quest, QuestStatus, User } from '../types';
import { supabaseService } from '../services/supabaseService';

interface Props {
    quest: Quest;
    currentUser: User | null;
    onOpenDetail?: (q: Quest) => void;
}

const QuestCard: React.FC<Props> = ({ quest, currentUser, onOpenDetail }) => {
    const navigate = useNavigate();
    // Social Proof Logic
    const [friendsGoingCount, setFriendsGoingCount] = React.useState(0);

    React.useEffect(() => {
        if (!currentUser) return;
        supabaseService.profiles.getMutualFollows(currentUser.id).then(friendIds => {
            const count = friendIds.filter(id => quest.participant_ids?.includes(id)).length;
            setFriendsGoingCount(count);
        });
    }, [currentUser, quest.participant_ids]);

    // Time Logic
    const isLive = quest.status === QuestStatus.ACTIVE;

    // Check if quest is starting soon (within 24 hours)
    const startTime = new Date(quest.start_time).getTime();
    const [now, setNow] = React.useState(new Date().getTime());

    React.useEffect(() => {
        const interval = setInterval(() => setNow(new Date().getTime()), 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const diffMs = startTime - now;
    const isStartingSoon = diffMs > 0 && diffMs < 24 * 60 * 60 * 1000;

    const formatCountdown = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `Starts in ${hours}h ${minutes}m`;
    };

    const nextStep = quest.itinerary && quest.itinerary.length > 0 ? quest.itinerary[0] : null;

    return (
        <motion.div
            id={`quest-${quest.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, transition: { duration: 0.3, ease: "easeOut" } }}
            onClick={() => onOpenDetail?.(quest)}
            className="group flex flex-col w-full bg-white/5 backdrop-blur-3xl rounded-[2rem] overflow-hidden border border-white/5 cursor-pointer hover:border-primary/40 transition-all duration-500 shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] p-5 relative h-full"
        >
            {/* Vibe Aura Gradient - Subtle top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />

            {/* Header: Vibe Signals & Action */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 overflow-hidden mr-2">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/80 whitespace-nowrap">
                        {quest.category || 'SOCIALS'}{quest.activity ? ` • ${quest.activity}` : ''}
                    </div>

                    <span className="text-white/40">•</span>

                    {/* Integrated Visibility Icon Only - No Pill Background */}
                    <div className={
                        quest.visibility_scope === 'friends'
                            ? 'text-purple-400'
                            : 'text-primary'
                    }>
                        {quest.visibility_scope === 'friends' ? <Lock size={10} /> : (quest.visibility_scope === 'public' || !quest.visibility_scope ? <Globe size={10} /> : <Signal size={10} />)}
                    </div>

                    {isLive && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 rounded-md text-[7px] font-black uppercase tracking-widest text-red-500 animate-pulse ml-1">
                            <span className="w-1 h-1 rounded-full bg-red-500" /> LIVE
                        </div>
                    )}
                </div>

                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/40 group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300 shrink-0">
                    <ArrowRight size={14} strokeWidth={2.5} />
                </div>
            </div>

            {/* Core Info - Fixed Height Container */}
            <div className="flex flex-col gap-1.5 mb-5">
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-1">
                    {quest.title}
                </h3>
                {/* Description - Enforce 2 lines height */}
                <div className="h-[2rem]">
                    <p className="text-white/50 text-[11px] font-medium leading-relaxed line-clamp-2">
                        {quest.description || 'Join the squad.'}
                    </p>
                </div>

                {/* Vibe & Signals - Repositioned here for better organization */}
                {quest.vibe_signals && quest.vibe_signals.length > 0 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 mb-1">
                        {quest.vibe_signals.slice(0, 3).map((vibe, i) => (
                            <span key={i} className="text-[9px] font-bold text-white/50 tracking-wider uppercase flex items-center gap-1.5">
                                <span className="text-primary/60 text-[12px]">•</span> {vibe}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-1.5 mt-2.5">
                    <MapPin size={10} className="text-white/40 group-hover:text-primary/60 transition-colors" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/60 group-hover:text-white/80 transition-colors line-clamp-1 max-w-[120px]">
                        {quest.location?.place_name || 'Davao City, PH'}
                    </span>
                    <span className="text-white/30 mx-1">•</span>
                    <Clock size={10} className="text-white/40 group-hover:text-primary/60 transition-colors" />
                    <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${isStartingSoon ? 'text-electric-teal' : 'text-white/60 group-hover:text-white/80'}`}>
                        {isLive ? 'NOW' : (() => {
                            const date = new Date(quest.start_time);
                            const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
                            const timeStr = hasTime ? ` • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '';
                            return isStartingSoon
                                ? `${formatCountdown(diffMs)}${timeStr}`
                                : `${date.toLocaleDateString()}${timeStr}`;
                        })()}
                    </span>
                </div>
            </div>

            {/* Social Proof */}
            {friendsGoingCount > 0 && (
                <div className="flex items-center gap-1.5 mb-5 px-1 group-hover:translate-x-1 transition-transform">
                    <div className="flex -space-x-2">
                        {[...Array(Math.min(friendsGoingCount, 3))].map((_, i) => (
                            <div key={i} className="w-4 h-4 rounded-full border border-deep-black bg-zinc-800 flex items-center justify-center overflow-hidden ring-1 ring-white/10">
                                <img src={`https://i.pravatar.cc/50?u=${quest.id}-${i}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-electric-teal shadow-electric-teal/20">
                        {friendsGoingCount > 3 ? `+${friendsGoingCount} Friends` : `${friendsGoingCount} squad mutuals`}
                    </span>
                </div>
            )}

            {/* Footer: Capacity & CTA */}
            <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">Squad</span>
                        <div className="flex items-center gap-1.5">
                            <Users size={10} className="text-primary/60" />
                            <span className="text-[10px] font-black text-white">{quest.current_participants || 0}/{quest.capacity || '∞'}</span>
                        </div>
                    </div>

                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest group-hover:text-primary group-hover:translate-x-[-2px] transition-all">Details</span>
                    <ArrowRight size={12} className="text-white/40 group-hover:text-primary transition-all" />
                </div>
            </div>
        </motion.div>
    );
};

export default QuestCard;
