import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users } from 'lucide-react';

interface ChatFiltersProps {
    activeTab: 'ECHOES' | 'LOBBIES';
    setActiveTab: (tab: 'ECHOES' | 'LOBBIES') => void;
    activeCat: string;
    setActiveCat: (cat: string) => void;
}

const CHAT_CATEGORIES = ['All', 'Unread', 'Recent', 'Groups'];

export const ChatSidebar: React.FC<ChatFiltersProps> = ({
    activeTab,
    setActiveTab,
    activeCat,
    setActiveCat
}) => {
    return (
        <div className="flex flex-col w-full h-full relative select-none px-2 pb-4">
            {/* Minimal Tab Switcher */}
            <div className="flex flex-col gap-2 mb-6 w-full">
                {/* Echoes */}
                <button
                    onClick={() => setActiveTab('ECHOES')}
                    className={`
                        flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 relative group h-14 w-full
                        ${activeTab === 'ECHOES' ? 'text-primary' : 'text-white/40 hover:bg-white/5 hover:text-white'}
                    `}
                >
                    <MessageCircle size={22} strokeWidth={activeTab === 'ECHOES' ? 2.5 : 2} className="relative z-10" />
                    <span className="text-[9px] font-black uppercase tracking-widest relative z-10">Echoes</span>
                    {activeTab === 'ECHOES' && <motion.div layoutId="chatTabActive" className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(45,212,191,0.15)]" />}
                </button>

                {/* Lobbies */}
                <button
                    onClick={() => setActiveTab('LOBBIES')}
                    className={`
                        flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 relative group h-14 w-full
                        ${activeTab === 'LOBBIES' ? 'text-electric-teal' : 'text-white/40 hover:bg-white/5 hover:text-white'}
                    `}
                >
                    <Users size={22} className="relative z-10" />
                    <span className="text-[9px] font-black uppercase tracking-widest relative z-10">Lobbies</span>
                    {activeTab === 'LOBBIES' && <motion.div layoutId="chatTabActive" className="absolute inset-0 bg-electric-teal/10 rounded-xl border border-electric-teal/20 shadow-[0_0_15px_rgba(45,212,191,0.15)]" />}
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 w-full">
                <div className="h-px w-full bg-white/5 mb-3 mx-auto" />
                <h3 className="text-[8px] font-bold text-white/20 uppercase tracking-widest text-center mb-2">Filters</h3>
                {CHAT_CATEGORIES.map((cat) => {
                    const isActive = activeCat === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => setActiveCat(cat)}
                            className={`
                                w-full py-2.5 rounded-lg text-center transition-all duration-200 text-[8px] font-black uppercase tracking-wider
                                ${isActive ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-white/30 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export const ChatHeader: React.FC<ChatFiltersProps> = ({
    activeTab,
    setActiveTab,
    activeCat,
    setActiveCat
}) => {
    return (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Categories */}
            <div className="px-4">
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2">
                    {CHAT_CATEGORIES.map(cat => {
                        const isActive = activeCat === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveCat(cat)}
                                className={`
                                    relative h-9 px-5 rounded-full whitespace-nowrap text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 shrink-0
                                    ${isActive ? 'bg-primary text-black shadow-[0_0_15px_rgba(204,255,0,0.4)]' : 'bg-white/5 text-gray-400 border border-white/10'}
                                `}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
