import React from 'react';
import { MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Quest, QuestStatus, User } from '../types';

interface Props {
    quest: Quest;
    currentUser: User;
    onOpenDetail?: (q: Quest) => void;
}

const QuestCard: React.FC<Props> = ({ quest, onOpenDetail }) => {
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, transition: { duration: 0.3, ease: "easeOut" } }}
            onClick={() => onOpenDetail?.(quest)}
            className="group flex flex-col w-full bg-white/5 backdrop-blur-3xl rounded-[2rem] overflow-hidden border border-white/5 cursor-pointer hover:border-primary/40 transition-all duration-500 shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] p-5 relative h-full"
        >
            {/* Vibe Aura Gradient - Subtle top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />

            {/* Header: Vibe Signals & Action */}
            <div className="flex items-start justify-between mb-4 h-8">
                <div className="flex flex-wrap gap-2 flex-1 overflow-hidden h-full">
                    <div className="px-2.5 py-1 bg-primary/5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] text-primary whitespace-nowrap">
                        {quest.category || 'SOCIALS'}{quest.activity ? ` • ${quest.activity}` : ''}
                    </div>
                    {isLive && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/10 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] text-red-500 animate-pulse whitespace-nowrap">
                            <span className="w-1 h-1 rounded-full bg-red-500" /> LIVE
                        </div>
                    )}
                    {/* Always show up to 2 vibe signals if available, or fill with empty logic if needed to maintain height? No, h-8 protects the layout. */}
                    {quest.vibe_signals?.slice(0, 2).map((vibe, i) => (
                        <div key={i} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] text-gray-400 whitespace-nowrap">
                            {vibe}
                        </div>
                    ))}
                </div>

                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-600 group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300 shrink-0 ml-3">
                    <ArrowRight size={14} strokeWidth={2.5} />
                </div>
            </div>

            {/* Core Info - Fixed Height Container */}
            <div className="flex flex-col gap-1.5 mb-5">
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-1">
                    {quest.title}
                </h3>
                {/* Description - Enforce 2 lines height */}
                <div className="h-[2.5rem]">
                    <p className="text-gray-500 text-[11px] font-medium leading-relaxed line-clamp-2">
                        {quest.description || 'Join the squad.'}
                    </p>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                    <MapPin size={10} className="text-gray-600 group-hover:text-primary/60 transition-colors" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600 group-hover:text-gray-400 transition-colors line-clamp-1 max-w-[120px]">
                        {quest.location?.place_name || 'Davao City, PH'}
                    </span>
                    <span className="text-gray-700 mx-1">•</span>
                    <Clock size={10} className="text-gray-600 group-hover:text-primary/60 transition-colors" />
                    <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${isStartingSoon ? 'text-electric-teal' : 'text-gray-600 group-hover:text-gray-400'}`}>
                        {isLive ? 'NOW' : (isStartingSoon ? `${formatCountdown(diffMs)} • ${new Date(quest.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : `${new Date(quest.start_time).toLocaleDateString()} • ${new Date(quest.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)}
                    </span>
                </div>
            </div>

            {/* Immediate Plan Block (Highlight Next Step) */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center gap-3 mb-5 group-hover:bg-white/[0.04] transition-all">
                <div className="px-1.5 py-0.5 bg-white/5 rounded text-[7px] font-black text-gray-500 tracking-widest uppercase">NEXT</div>
                <div className="flex-1 min-w-0">
                    {nextStep ? (
                        <p className="text-[10px] font-bold text-gray-400 truncate">
                            <span className="text-white">{nextStep.time}</span> <span className="text-gray-600 mx-1">•</span> {nextStep.description}
                        </p>
                    ) : (
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Ready for deployment</p>
                    )}
                </div>
            </div>

            {/* Footer: Squad & Host */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={quest.host?.avatar_url || `https://ui-avatars.com/api/?name=${quest.host?.username || 'H'}&background=random`}
                            className="w-6 h-6 rounded-lg border border-white/5 object-cover group-hover:border-primary/40 transition-all duration-300"
                            alt="host"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-primary rounded-md border border-deep-black" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">
                        {quest.host?.username || 'User'}
                    </span>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.02] border border-white/5">
                        <Users size={10} className="text-gray-600 group-hover:text-primary transition-colors" />
                        <span className="text-[9px] font-bold text-gray-400">{quest.current_participants || 0}/{quest.capacity || quest.max_participants || '∞'}</span>
                    </div>
                    {/* Visual Progress Bar (Anchored under pill) */}
                    {(quest.capacity || quest.max_participants) && (
                        <div className="w-10 h-0.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((quest.current_participants || 0) / (quest.capacity || quest.max_participants || 1)) * 100}%` }}
                                className="h-full bg-primary/80"
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default QuestCard;
