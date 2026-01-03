import React, { useState } from 'react';
import { MapPin, Trophy } from 'lucide-react';
import { Quest, QuestType } from '../types';

interface Props {
    quest: Quest;
    onJoin: (id: string) => void;
}

const QuestCard: React.FC<Props> = ({ quest, onJoin }) => {
    const [joined, setJoined] = useState(false);
    const spotsLeft = quest.max_participants - quest.current_participants;
    const isFull = spotsLeft <= 0;

    const handleJoin = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!joined && !isFull && quest.status !== 'cancelled') {
            const confirmJoin = window.confirm(`Join ${quest.title} for ${quest.fee > 0 ? '₱' + quest.fee.toLocaleString() : 'Free'}?`);
            if (confirmJoin) {
                setJoined(true);
                onJoin(quest.id);
            }
        }
    };

    const truncatedDescription = quest.description
        ? quest.description.split(' ').slice(0, 8).join(' ') + (quest.description.split(' ').length > 8 ? '...' : '')
        : 'No description provided.';

    return (
        <div className="group relative w-full h-44 rounded-[2rem] overflow-hidden mb-4 shrink-0 transition-all duration-300 hover:scale-[1.02] shadow-lg cursor-pointer bg-[#1E1E1E]/90 border border-white/5 backdrop-blur-sm">

            {/* Content Container */}
            <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">

                {/* Header Row */}
                <div className="flex justify-between items-start">
                    {/* Tags - Specific Type instead of Category */}
                    <div className="flex gap-2">
                        <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-300 shadow-sm">
                            {quest.activity || quest.category}
                        </span>

                        {quest.type === QuestType.COMPETITION && (
                            <span className="bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-yellow-500 flex items-center gap-1 shadow-sm">
                                <Trophy size={10} /> Comp
                            </span>
                        )}
                    </div>

                    {/* Fee Badge (Top Right) - No Entry Text, PHP */}
                    <div className={`px-3 py-1 rounded-lg border backdrop-blur-md flex items-center gap-1.5 ${quest.status === 'cancelled'
                        ? 'bg-gray-900/50 border-gray-500 text-gray-400'
                        : isFull
                            ? 'bg-red-900/50 border-red-500 text-red-500'
                            : 'bg-primary/5 border-primary/20 text-primary'
                        }`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                            {quest.status === 'cancelled' ? 'Cancelled' : isFull ? 'Full' : quest.fee > 0 ? `₱${quest.fee.toLocaleString()}` : 'Free'}
                        </span>
                    </div>
                </div>

                {/* Middle Content: Title & Location */}
                <div className="flex-1 flex flex-col justify-center mt-2 pl-1">
                    <h3 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none mb-1.5 drop-shadow-sm truncate pr-4">
                        {quest.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-gray-400 mb-2">
                        <MapPin size={12} className="text-gray-500" />
                        <span className="text-[11px] font-medium">{quest.location || 'Location TBA'}</span>
                    </div>
                    {/* Truncated Description */}
                    <p className="text-[10px] text-gray-500 font-medium opacity-80 max-w-[90%] leading-relaxed">
                        {truncatedDescription}
                    </p>
                </div>

                {/* Bottom Row: Avatars, Time/Spots (No Distance Bar) */}
                <div className="flex items-end justify-between mt-1">

                    {/* Left: Host */}
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            <img src={quest.host.avatar_url} className="w-7 h-7 rounded-full border border-[#1E1E1E] object-cover" />
                            {quest.current_participants > 1 && (
                                <div className="w-7 h-7 rounded-full bg-surface border border-[#1E1E1E] flex items-center justify-center text-[9px] font-bold text-gray-400">
                                    +{quest.current_participants - 1}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] uppercase font-bold text-gray-600 tracking-wider">Host</span>
                            <span className="text-[10px] font-bold text-gray-400">{quest.host.username}</span>
                        </div>
                    </div>

                    {/* Right: Time & Spots */}
                    <div className="flex flex-col items-end mr-1">
                        <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-white font-black text-lg leading-none tracking-tight">
                                {(() => {
                                    const d = new Date(quest.start_time);
                                    return !isNaN(d.getTime())
                                        ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                                        : quest.start_time
                                })()}
                            </span>
                        </div>
                        <div className={`text-[10px] font-bold uppercase tracking-wider ${isFull ? 'text-red-500' : 'text-primary'}`}>
                            {spotsLeft} Spots Left
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default QuestCard;
