
import React, { useState, useEffect } from 'react';
import { Calendar, History as HistoryIcon, ArrowLeft, CloudOff } from 'lucide-react';
import { Quest, QuestStatus, User } from '../types';
import { MOCK_USER } from '../constants';
import QuestCard from './QuestCard';
import { supabaseService } from '../services/supabaseService';
import { HeartbeatLoader } from './HeartbeatLoader';

interface MyQuestsScreenProps {
    onBack: () => void;
    onOpenQuest: (q: Quest) => void;
    currentUser: User;
}

const MyQuestsScreen: React.FC<MyQuestsScreenProps> = ({ onBack, onOpenQuest, currentUser }) => {
    const [activeTab, setActiveTab] = useState<'UPCOMING' | 'HISTORY'>('UPCOMING');
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch users quests (Host or Participant)
        if (currentUser?.id) {
            setLoading(true);
            supabaseService.quests.getMyQuests(currentUser.id).then(myQuests => {
                setQuests(myQuests);
                setLoading(false);
            });
        }
    }, [currentUser?.id]);

    const filteredQuests = quests.filter(q => {
        const now = new Date();
        const startTime = new Date(q.start_time);
        const isPast = !isNaN(startTime.getTime()) && startTime.getTime() < now.getTime(); // Simply using pure time for now, or use buffer

        // UPCOMING:
        // - Status is OPEN or FULL
        // - AND Time is NOT in the past (or maybe allow recent past? stick to future for "Upcoming")
        // - OR if it is "Ongoing"? (not a status yet).
        // Let's use: Status NOT cancelled/completed AND Not effectively past

        // HISTORY:
        // - Status is COMPLETED or CANCELLED
        // - OR Time is past

        if (activeTab === 'UPCOMING') {
            const isActiveStatus = q.status !== QuestStatus.COMPLETED && q.status !== QuestStatus.CANCELLED;
            // Show if it's active and either in the future or within the last 2 hours (active window)
            const isRelevantTime = !isNaN(startTime.getTime()) && startTime.getTime() + (2 * 60 * 60 * 1000) > now.getTime();
            return isActiveStatus && isRelevantTime;
        } else {
            // HISTORY
            const isDoneStatus = q.status === QuestStatus.COMPLETED || q.status === QuestStatus.CANCELLED;
            const isOldTime = !isNaN(startTime.getTime()) && startTime.getTime() + (2 * 60 * 60 * 1000) <= now.getTime();
            return isDoneStatus || isOldTime;
        }
    });

    // Sort: Upcoming = Soonest first. History = Newest (most recent) first.
    const sortedQuests = [...filteredQuests].sort((a, b) => {
        const tA = new Date(a.start_time).getTime();
        const tB = new Date(b.start_time).getTime();
        if (activeTab === 'UPCOMING') {
            return tA - tB; // Ascending (Earliest first)
        } else {
            return tB - tA; // Descending (Newest first)
        }
    });

    return (
        <div className="absolute inset-0 z-[50] bg-black flex flex-col animate-in slide-in-from-right duration-300 safe-area-bottom">

            {/* Header */}
            <div className="p-6 pt-[15px] flex items-center gap-4 bg-black z-10">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter">My Quests</h1>
            </div>

            {/* Tabs */}
            <div className="px-6 mb-6">
                <div className="flex bg-surface p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('UPCOMING')}
                        className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'UPCOMING' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Calendar size={14} /> Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab('HISTORY')}
                        className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'HISTORY' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <HistoryIcon size={14} /> History
                    </button>
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto px-4 pb-14">
                {loading ? (
                    <HeartbeatLoader />
                ) : sortedQuests.length > 0 ? (
                    sortedQuests.map(q => (
                        <QuestCard
                            key={q.id}
                            quest={q}
                            currentUser={currentUser}
                            onJoin={() => { }}
                            onOpenDetail={onOpenQuest}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 opacity-50">
                        <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-4">
                            <CloudOff size={32} className="text-gray-500" />
                        </div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                            {activeTab === 'UPCOMING' ? 'No Upcoming Quests' : 'No Quest History'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyQuestsScreen;
