import React from 'react';
import { MapPin, Users, Zap, Calendar, Star, Edit2, UserPlus, Clock, Check, Lock, Globe, AlertCircle } from 'lucide-react';
import { Quest, QuestType, QuestStatus, User, QuestVisibilityScope } from '../types';

interface Props {
    quest: Quest;
    currentUser: User;
    onJoin: (id: string, q: Quest) => void;
    onEdit?: (q: Quest) => void;
    onDelete?: (q: Quest) => void;
    onOpenDetail?: (q: Quest) => void;
}

const QuestCard: React.FC<Props> = ({ quest, currentUser, onJoin, onEdit, onOpenDetail }) => {
    const isHost = quest.host_id === currentUser.id;
    const participants = quest.participants || [];
    const isSquad = participants.some(p => p.id === currentUser.id);
    const pendingParticipants = quest.pending_participants || [];
    const isHunter = pendingParticipants.some(p => p.id === currentUser.id);

    const spotsLeft = (quest.max_participants || 100) - (quest.current_participants || 0);
    const isFull = spotsLeft <= 0;

    // Time Logic
    const startTime = new Date(quest.start_time);
    const now = new Date();
    const timeDiff = startTime.getTime() - now.getTime();
    const minutesToStart = Math.floor(timeDiff / (1000 * 60));
    const hoursToStart = Math.floor(minutesToStart / 60);
    const daysToStart = Math.floor(hoursToStart / 24);

    const isStartingSoon = minutesToStart > 0 && minutesToStart <= 60;
    const isLive = quest.status === QuestStatus.ACTIVE;
    const isUpcoming = !isLive && timeDiff > 0;

    // Styling based on mode & state
    const getStyles = () => {
        if (quest.mode === QuestType.SPONTY) {
            return {
                border: 'border-primary/10',
                glow: 'shadow-[0_0_20px_rgba(204,255,0,0.05)]',
                accentText: 'text-primary',
                accentBg: 'bg-primary',
                subtleBg: 'bg-primary/5'
            };
        }
        return {
            border: 'border-white/[0.02]',
            glow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]', // Purple glow on hover for Canon
            accentText: 'text-purple-400',
            accentBg: 'bg-purple-500',
            subtleBg: 'bg-purple-500/10'
        };
    };

    const s = getStyles();

    // Contextual Badge
    const renderStateBadge = () => {
        if (isLive) {
            return (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">LIVE</span>
                </div>
            );
        }
        if (isStartingSoon) {
            return (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                    <Clock size={10} className="text-orange-500" />
                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Starts in {minutesToStart}m</span>
                </div>
            );
        }
        if (isUpcoming) {
            let timeLabel = '';
            if (daysToStart > 0) timeLabel = `${daysToStart}D`;
            else if (hoursToStart > 0) timeLabel = `${hoursToStart}h`;
            else timeLabel = `${minutesToStart}m`;

            return (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <Clock size={10} className="text-blue-500" />
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{timeLabel}</span>
                </div>
            );
        }
        if (quest.mode === QuestType.SPONTY) {
            return (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                    <Zap size={10} className="text-primary" />
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Happening</span>
                </div>
            );
        }
        return null;
    };

    return (
        <div
            onClick={() => onOpenDetail?.(quest)}
            className={`group relative w-full mb-4 bg-[#0a0a0a] rounded-[2rem] overflow-hidden border transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${s.border} ${s.glow}`}
        >
            {/* Background Gradient Mesh */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-transparent via-transparent to-${quest.mode === QuestType.SPONTY ? 'primary' : 'purple-500'}`} />

            <div className="p-5 flex flex-col gap-3 relative z-10">

                {/* Header Row: Category | Activity | Badges */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{quest.category}</span>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span className={`text-[9px] font-black uppercase tracking-widest ${s.accentText}`}>{quest.activity}</span>

                        {quest.visibility_scope === QuestVisibilityScope.FRIENDS && (
                            <div className="flex items-center gap-1 ml-2 text-gray-600">
                                <Lock size={10} />
                                <span className="text-[8px] font-black uppercase tracking-widest">Circle</span>
                            </div>
                        )}

                        {quest.aura_req && quest.aura_req > 0 && (
                            <div className="flex items-center gap-1 ml-2 text-primary/80">
                                <Star size={10} fill="currentColor" />
                                <span className="text-[8px] font-black uppercase tracking-widest">{quest.aura_req}+ Aura</span>
                            </div>
                        )}
                    </div>
                    {renderStateBadge()}
                </div>

                {/* Main Content */}
                <div>
                    <h3 className="text-xl font-black italic text-white tracking-tighter leading-none mb-1.5 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                        {quest.title}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed line-clamp-2 mb-2">
                        {/* Removed inline time from description per v1.2 spec */}
                        {quest.description}
                    </p>

                    {/* Signals / Tags */}
                    {((quest.signals?.social?.length || 0) + (quest.signals?.vibe?.length || 0)) > 0 && (
                        <div className="flex flex-wrap gap-1.5 opacity-60">
                            {quest.signals?.social?.map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 rounded border border-white/5 text-[7px] font-black uppercase tracking-widest text-gray-500">#{tag}</span>
                            ))}
                            {quest.signals?.vibe?.map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 rounded border border-primary/10 bg-primary/[0.02] text-[7px] font-black uppercase tracking-widest text-primary/70">#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Host & Avatars */}
                <div className="flex items-center justify-between mt-1">
                    <div className="flex-1 overflow-hidden mr-4">
                        <div className="flex items-center gap-1.5 mb-1.5 text-[8px] font-black text-gray-700 uppercase tracking-[0.2em]">
                            <MapPin size={10} className="text-gray-800" />
                            <span className="truncate">{quest.location?.address_full || quest.location?.place_name || "Zone TBD"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <img src={quest.host?.avatar_url} className="w-5 h-5 rounded-full border border-white/[0.05]" />
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest truncate">{quest.host?.username}</span>
                        </div>
                    </div>

                    {/* Join Action / Status */}
                    <div className="flex items-center">
                        {isHost ? (
                            <button onClick={(e) => { e.stopPropagation(); onEdit?.(quest) }} className="p-2 text-gray-500 hover:text-white transition-colors">
                                <Edit2 size={14} />
                            </button>
                        ) : isSquad ? (
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                                <Check size={12} /> Joined
                            </span>
                        ) : isHunter ? (
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Requested</span>
                        ) : (
                            !isFull && quest.status !== QuestStatus.CANCELLED && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onJoin(quest.id, quest); }}
                                    className={`px-4 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-1.5`}
                                >
                                    <UserPlus size={12} strokeWidth={3} />
                                    <span>Hunt</span>
                                </button>
                            )
                        )}
                    </div>
                </div>

            </div>

            {/* Info Strip (Footer) */}
            <div className="px-5 py-2.5 bg-white/2 border-t border-white/5 flex items-center justify-between text-[9px] font-bold text-gray-500 uppercase tracking-widest">

                {/* Time Proximity / Status */}
                <div className="flex items-center gap-1.5">
                    {isLive ? (
                        <span className="text-white">Ends {quest.end_time ? new Date(quest.end_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Soon'}</span>
                    ) : (
                        <span>
                            {new Date(quest.start_time).toDateString() === new Date().toDateString() ? 'Today' : new Date(quest.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            , {new Date(quest.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </span>
                    )}
                </div>

                {/* Join Rule & Capacity */}
                <div className="flex items-center gap-3">
                    <span className={quest.approval_required ? 'text-gray-500' : s.accentText}>
                        {quest.approval_required ? 'Approval' : 'Instant'}
                    </span>
                    <div className="w-[1px] h-2 bg-white/10" />
                    <span className={isFull ? 'text-red-500' : 'text-white'}>
                        {quest.current_participants}/{quest.max_participants || '∞'} Spots
                    </span>
                </div>
            </div>
        </div>
    );
};

export default QuestCard;
