
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
            case 'registration_open': return 'bg-electric-teal text-black';
            case 'ongoing': return 'bg-yellow-500 text-black';
            case 'upcoming': return 'bg-blue-500 text-white';
            case 'past': return 'bg-gray-600 text-gray-300';
            default: return 'bg-white/5 text-gray-400';
        }
    };

    const formatStatus = (status: string) => {
        return status.replace('_', ' ');
    };

    return (
        <div
            onClick={onClick}
            className="group flex flex-col w-full bg-white/5 rounded-[2.5rem] overflow-hidden border border-white/5 cursor-pointer hover:border-electric-teal/30 transition-all duration-500 shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] bg-gradient-to-br from-white/[0.05] to-transparent"
        >
            {/* Background Image Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                    src={competition.image_url}
                    alt={competition.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Top Overlay Row */}
                <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
                    <div className={`px-3 py-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-white`}>
                        {competition.sub_category || 'Tournament'}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyle(competition.status)}`}>
                        {formatStatus(competition.status)}
                    </div>
                </div>

                {/* Center Action Badge */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-electric-teal text-black flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_20px_rgba(45,212,191,0.5)]">
                        <Trophy size={20} strokeWidth={3} />
                    </div>
                </div>
            </div>

            {/* Metadata Section */}
            <div className="p-5 flex flex-col gap-2 flex-1 relative">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none group-hover:text-electric-teal transition-colors line-clamp-2 pr-4">
                        {competition.title}
                    </h3>
                </div>

                <div className="flex flex-col gap-0.5 mt-0.5">
                    <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                        <Calendar size={10} className="text-electric-teal" />
                        <span>{competition.date_range}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 text-[9px] font-black uppercase tracking-widest">
                        <MapPin size={10} className="text-electric-teal" />
                        <span>{competition.location}</span>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-2 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div>
                        <span className="block text-[8px] text-gray-600 font-black uppercase tracking-widest mb-0.5">Prize Pool</span>
                        <div className="text-yellow-400 font-black italic text-lg shadow-black">
                            {competition.prize_pool}
                        </div>
                    </div>
                    <div className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] group-hover:bg-electric-teal group-hover:text-black transition-colors">
                        Register
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompetitionCard;
