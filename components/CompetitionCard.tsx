
import React from 'react';
import { Competition } from '../types';
import { Calendar, MapPin, Trophy } from 'lucide-react';

interface CompetitionCardProps {
    competition: Competition;
    onClick: () => void;
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({ competition, onClick }) => {

    // Status Badge Helpers
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'registration_open': return 'bg-primary text-black';
            case 'ongoing': return 'bg-yellow-500 text-black';
            case 'upcoming': return 'bg-blue-500 text-white';
            case 'past': return 'bg-gray-600 text-gray-300';
            default: return 'bg-surface text-gray-400';
        }
    };

    const formatStatus = (status: string) => {
        return status.replace('_', ' ');
    };

    return (
        <div
            onClick={onClick}
            className="group relative w-full h-48 rounded-3xl overflow-hidden bg-card border border-white/10 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.1)] transition-all duration-300"
        >
            {/* Background Image with Zoom Effect */}
            <div className="absolute inset-0">
                <img
                    src={competition.image_url}
                    alt={competition.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
            </div>

            {/* Content Container */}
            <div className="relative h-full flex flex-col justify-between p-5">

                {/* Top Row: Status & Category */}
                <div className="flex justify-between items-start">
                    <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${getStatusStyle(competition.status)}`}>
                        {formatStatus(competition.status)}
                    </div>
                    {competition.sub_category && (
                        <div className="px-2 py-1 rounded-md bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-bold text-gray-300 uppercase tracking-wide">
                            {competition.sub_category}
                        </div>
                    )}
                </div>

                {/* Bottom Row: Details */}
                <div className="flex justify-between items-end">
                    <div className="flex-1 pr-4">
                        <h3 className="text-white font-black italic text-lg leading-tight mb-2 drop-shadow-md line-clamp-2">
                            {competition.title}
                        </h3>

                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-gray-300 text-[11px] font-bold">
                                <Calendar size={12} className="text-primary" />
                                <span>{competition.date_range}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300 text-[11px] font-bold">
                                <MapPin size={12} className="text-primary" />
                                <span>{competition.location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Prize Pool */}
                    <div className="text-right shrink-0">
                        <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Prize Pool</span>
                        <div className="flex items-center justify-end gap-1 text-yellow-400">
                            <Trophy size={14} />
                            <span className="font-black italic text-xl shadow-black drop-shadow-sm">{competition.prize_pool}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompetitionCard;
