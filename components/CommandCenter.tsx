import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, TrendingUp, Users, Zap, Compass, ChevronRight, Star, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { supabaseService } from '../services/supabaseService';
import { Quest } from '../types';

export const CommandCenter: React.FC = () => {
    const { user } = useAuth();
    const { setTabs } = useNavigation();
    const navigate = useNavigate();
    const [trendingQuest, setTrendingQuest] = useState<Quest | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setTabs([]); // Clear contextual tabs on dashboard
        const loadDashboard = async () => {
            setIsLoading(true);
            // Simulate fetching a "Trending" quest
            const quests = await supabaseService.quests.getQuests('All', user?.id);
            if (quests.length > 0) {
                setTrendingQuest(quests[0]);
            }
            setIsLoading(false);
        };
        loadDashboard();
    }, [user?.id]);

    if (!user) return null;

    const stats = [
        { label: 'LEVEL', value: user.level || 1, icon: Star, color: 'text-yellow-400' },
        { label: 'AURA', value: (user.aura?.score || user.reliability_score || 0).toLocaleString(), icon: Zap, color: 'text-primary' },
        { label: 'STREAK', value: 0, icon: TrendingUp, color: 'text-blue-400' }, // Streak disabled visually or 0
    ];

    return (
        <div className="flex-1 h-full overflow-y-auto bg-deep-black p-6 md:p-10 relative">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 blur-[120px] pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/5 blur-[100px] pointer-events-none rounded-full" />

            <div className="max-w-7xl mx-auto space-y-8 relative z-10 w-full">

                {/* Header Welcome */}
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Command Center</h2>
                        <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter">
                            Welcome back, <span className="animate-liquid-text">{user.name?.split(' ')[0] || 'Agent'}</span>
                        </h1>
                    </div>
                    <div className="hidden md:block text-right">
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">System Status</div>
                        <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Online
                        </div>
                    </div>
                </div>

                {/* BENTO GRID LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[500px]">

                    {/* HERO DISCOVERY CARD (Span 8) */}
                    <div className="md:col-span-8 h-[400px] md:h-full relative group cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-md transition-all hover:border-white/20"
                        onClick={() => navigate('/app/quests')}
                    >
                        {trendingQuest ? (
                            <>
                                <img src={trendingQuest.image_url} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/50 to-transparent" />

                                <div className="absolute top-6 left-6 flex gap-2">
                                    <div className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                                        Trending Mission
                                    </div>
                                </div>

                                <div className="absolute bottom-8 left-8 right-8">
                                    <h3 className="text-4xl font-black animate-liquid-text italic uppercase tracking-tight mb-2 leading-none">
                                        {trendingQuest.title}
                                    </h3>
                                    <p className="text-gray-300 line-clamp-2 max-w-xl text-sm font-medium mb-6">
                                        {trendingQuest.description}
                                    </p>

                                    <div className="flex items-center gap-4">
                                        <button className="bg-primary hover:bg-white text-black px-6 py-3 rounded-xl font-black uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105">
                                            <Play size={18} fill="currentColor" /> Start Mission
                                        </button>
                                        <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-wider">
                                            <Users size={14} /> <span>{trendingQuest.participants_count || 128} Agents</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-white/20">
                                <Compass size={48} className="animate-pulse" />
                            </div>
                        )}
                    </div>

                    {/* SIDE COLUMN (Span 4) */}
                    <div className="md:col-span-4 flex flex-col gap-6 h-full">

                        {/* STATS MODULE */}
                        <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 backdrop-blur-md flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Agent Stats</h3>
                                <Star size={16} className="text-yellow-400" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {stats.slice(0, 2).map((stat) => (
                                    <div key={stat.label} className="bg-black/20 rounded-2xl p-4 border border-white/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <stat.icon size={14} className={stat.color} />
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">{stat.label}</span>
                                        </div>
                                        <div className="text-2xl font-black animate-liquid-text italic">{stat.value}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">XP Progress</span>
                                    <span className="text-[10px] font-bold text-white">Level {user.level || 1}</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-primary to-blue-500 w-[65%]" />
                                </div>
                            </div>
                        </div>

                        {/* ACTIVE LOBBIES / FRIENDS (Placeholder) */}
                        <div className="h-48 bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 backdrop-blur-md overflow-hidden relative group">
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Comms</h3>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            </div>

                            <div className="space-y-3 relative z-10">
                                {[1, 2].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer" onClick={() => navigate('/app/chat')}>
                                        <div className="w-8 h-8 rounded-full bg-gray-700/50 border border-white/10 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/150?u=${i + 20}`} className="w-full h-full object-cover opacity-80" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-white truncate">Squad Alpha</div>
                                            <div className="text-[10px] text-gray-500 truncate">Mission planning...</div>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-600" />
                                    </div>
                                ))}
                            </div>

                            {/* Decorative Grid Background */}
                            <div className="absolute inset-0 opacity-[0.03]"
                                style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                            />
                        </div>
                    </div>

                </div>

                {/* BOTTOM ROW: More Discovery */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Recommended', 'Nearby', 'Competitions', 'Socials'].map((cat, i) => (
                        <div key={cat}
                            onClick={() => navigate('/app/quests')}
                            className="h-32 bg-card border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-primary/30 transition-all cursor-pointer"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-50 text-white/20 group-hover:text-primary/20 transition-colors">
                                <Compass size={40} className={`transform ${i % 2 === 0 ? 'rotate-12' : '-rotate-12'}`} />
                            </div>
                            <h4 className="text-white font-black italic uppercase text-lg relative z-10 mt-auto pt-8">{cat}</h4>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider relative z-10">View All</div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};
