import React from 'react';
import { MapPin, Users, Zap, Clock, Star, ArrowRight, Lock } from 'lucide-react';
import { Quest, QuestType, QuestStatus, User } from '../types';

interface Props {
    quest: Quest;
    currentUser: User;
    onOpenDetail?: (q: Quest) => void;
}

const QuestCard: React.FC<Props> = ({ quest, onOpenDetail }) => {
    // Time Logic
    const isLive = quest.status === QuestStatus.ACTIVE;

    // Check if quest is starting soon (simulated for MVP)
    const startTime = new Date(quest.start_time).getTime();
    const now = new Date().getTime();
    const isStartingSoon = !isLive && (startTime - now) < (60 * 60 * 1000) && (startTime - now) > 0;

    return (
        <div
            onClick={() => onOpenDetail?.(quest)}
            className="group flex flex-col w-full bg-white/[0.03] backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-white/5 cursor-pointer hover:border-primary/30 transition-all duration-500 shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] bg-gradient-to-br from-white/[0.05] to-transparent p-4 md:p-6 hover:translate-y-[-4px]"
        >
            {/* Header: Badges & Status */}
            <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex gap-1.5 md:gap-2">
                    <div className="px-2 py-0.5 md:px-3 md:py-1 bg-white/5 border border-white/10 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest text-primary">
                        {quest.category}
                    </div>
                    {isLive && (
                        <div className="px-2 py-0.5 md:px-3 md:py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1 animate-pulse">
                            <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-red-500 rounded-full" /> LIVE
                        </div>
                    )}
                    {isStartingSoon && (
                        <div className="px-2 py-0.5 md:px-3 md:py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                            <Clock size={8} className="md:w-[10px]" /> SOON
                        </div>
                    )}
                    <div className="px-2 py-0.5 md:px-3 md:py-1 bg-white/5 border border-white/10 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest text-white/40">
                        PROTOTYPE
                    </div>
                </div>
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-300">
                    <ArrowRight size={12} strokeWidth={3} className="md:w-[14px]" />
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="text-base md:text-xl font-black italic uppercase tracking-tighter text-white leading-tight group-hover:text-primary transition-colors">
                        {quest.title}
                    </h3>
                </div>

                <div className="flex flex-col gap-1 mt-0.5">
                    <p className="text-gray-400 text-[10px] md:text-xs font-bold leading-relaxed line-clamp-2">
                        {quest.description || 'Global Quest'}
                    </p>
                    <p className="text-gray-500 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 mt-0.5">
                        <MapPin size={8} className="text-primary md:w-[10px]" /> {quest.location?.place_name || 'Davao City, PH'}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                        <div className="relative">
                            <img
                                src={quest.host?.avatar_url || `https://ui-avatars.com/api/?name=${quest.host?.username || 'Hunter'}&background=random`}
                                className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-white/20 object-cover"
                                alt="host"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full border border-deep-black" />
                        </div>
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/80 italic">
                            <span className="animate-liquid-text">
                                {quest.host?.username || 'user'}
                            </span>
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] md:text-[10px] text-white font-bold bg-white/5 px-2 md:px-2.5 py-1 rounded-lg border border-white/5">
                        <Users size={10} className="text-primary md:w-[12px]" />
                        <span>{quest.current_participants || 0}/{quest.max_participants || '∞'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestCard;

