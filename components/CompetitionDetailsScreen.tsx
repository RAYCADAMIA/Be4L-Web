
import React from 'react';
import { Calendar, MapPin, ChevronLeft, Trophy } from 'lucide-react';
import { Competition } from '../types';

interface CompetitionDetailsScreenProps {
    competition: Competition;
    onClose: () => void;
}

const CompetitionDetailsScreen: React.FC<CompetitionDetailsScreenProps> = ({ competition, onClose }) => {
    return (
        <div className="absolute inset-0 z-[60] bg-black flex flex-col animate-in slide-in-from-bottom duration-300 safe-area-bottom overflow-y-auto">

            {/* Header / Title Area */}
            <div className="p-6 pt-12 pb-2">
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center text-white mb-6">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded bg-surface">{competition.sub_category || competition.category}</span>
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> {competition.status.replace('_', ' ')}
                    </span>
                </div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">
                    {competition.title}
                </h1>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wide">• Registration Ends Soon</p>
            </div>

            {/* Main Cards Grid */}
            <div className="px-6 grid grid-cols-2 gap-4 mb-6">
                <div className="bg-card border border-white/10 p-4 rounded-2xl">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Prize Pool</p>
                    <p className="text-electric-teal font-black text-xl">{competition.prize_pool}</p>
                </div>
                <div className="bg-card border border-white/10 p-4 rounded-2xl">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Organizer</p>
                    <p className="text-white font-bold text-md truncate">{competition.organizer || 'TBA'}</p>
                </div>
            </div>

            {/* Info Rows */}
            <div className="px-6 space-y-4 mb-8">
                <div className="flex items-center gap-4 bg-surface/50 border border-white/5 p-3 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-card border border-white/10 flex items-center justify-center shrink-0">
                        <Calendar size={18} className="text-gray-400" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Schedule</p>
                        <p className="text-white font-bold text-sm">{competition.date_range}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-surface/50 border border-white/5 p-3 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-card border border-white/10 flex items-center justify-center shrink-0">
                        <MapPin size={18} className="text-gray-400" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Location</p>
                        <p className="text-white font-bold text-sm">{competition.location}</p>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="px-6 space-y-4 mb-24">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Description</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                    {competition.description || 'No description available.'}
                </p>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-black border-t border-white/10 safe-area-bottom">
                <button className="w-full bg-white text-black font-black py-4 rounded-xl text-md uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(45,212,191,0.4)]">
                    Register Now
                </button>
            </div>

        </div>
    );
};

export default CompetitionDetailsScreen;
