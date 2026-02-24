import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, Trash2, Bell, Star, Heart, MessageCircle, Calendar, CheckSquare, LogOut, Settings, User, ArrowRight, Zap, Search, Layout, Bookmark, History, Target, TrendingUp, Sparkles, ShoppingBag, Sun, Moon, CloudSun } from 'lucide-react';
import { ThemeMode, useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { dailyService } from '../../services/dailyService';
import { DailyTask } from '../../types';

// --- TASK WINDOW ---
export const TaskWindow: React.FC = () => {
    const [tasks, setTasks] = useState<DailyTask[]>(() => dailyService.getTasks());
    const [newItem, setNewItem] = useState('');

    const refreshTasks = () => {
        setTasks(dailyService.getTasks());
    };

    const addTask = () => {
        if (!newItem.trim()) return;
        dailyService.addTask(newItem);
        setNewItem('');
        refreshTasks();
    };

    const toggleTask = (id: string) => {
        dailyService.toggleTask(id);
        refreshTasks();
    };

    const deleteTask = (id: string) => {
        dailyService.deleteTask(id);
        refreshTasks();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mt-2 p-1.5 w-[240px] bg-[var(--bg-glass)] backdrop-blur-[80px] backdrop-contrast-[0.85] border border-[var(--border-glass)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[480px]"
        >
            <div className="px-2 py-2 mb-1 border-b border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">Side Quests</span>
            </div>

            <div className="flex-1 overflow-y-auto p-1.5 no-scrollbar space-y-1">
                {/* Simplified Input */}
                <div className="flex gap-1.5 mb-2 px-1">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        placeholder="Add objective..."
                        className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-[10px] text-white focus:border-white/20 outline-none transition-all placeholder-white/20 font-black uppercase tracking-wider"
                    />
                    <button
                        onClick={addTask}
                        disabled={!newItem.trim()}
                        className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-20 shrink-0"
                    >
                        <Plus size={14} strokeWidth={3} />
                    </button>
                </div>

                {tasks.length === 0 ? (
                    <div className="py-6 text-center">
                        <p className="text-[9px] font-black text-white/10 uppercase tracking-widest">No active quests</p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div
                            key={task.id}
                            className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-300 ${task.completed ? 'opacity-40' : 'hover:bg-white/10'}`}
                        >
                            <button
                                onClick={() => toggleTask(task.id)}
                                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${task.completed ? 'bg-white border-white' : 'border-white/20 hover:border-white/40'}`}
                            >
                                {task.completed && <Check size={10} className="text-black" strokeWidth={4} />}
                            </button>
                            <span
                                onClick={() => toggleTask(task.id)}
                                className={`flex-1 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${task.completed ? 'line-through' : 'text-[var(--text-primary)]'}`}
                            >
                                {task.text}
                            </span>
                            <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
};

// --- NOTIFICATION WINDOW ---
const MOCK_NOTIFICATIONS = [
    { id: '1', type: 'LIKE', user: { name: 'sarah_j', avatar: 'https://picsum.photos/100/100?random=2' }, text: 'liked your memory.', time: '2m', read: false },
    { id: '2', type: 'COMMENT', user: { name: 'dave_climbs', avatar: 'https://picsum.photos/100/100?random=8' }, text: 'commented on your post.', time: '15m', read: false },
    { id: '3', type: 'INVITE', user: { name: 'pickle_king', avatar: 'https://picsum.photos/100/100?random=9' }, text: 'invited you to a quest.', time: '1h', read: true },
    { id: '4', type: 'SYSTEM', text: 'Welcome to Be4L! Your streak has started.', time: '1d', read: true },
];

export const NotificationWindow: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mt-2 p-1.5 w-[240px] bg-[var(--bg-glass)] backdrop-blur-[80px] backdrop-contrast-[0.85] border border-[var(--border-glass)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[480px]"
        >
            <div className="px-3 py-2 mb-1 border-b border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Notifs</span>
                <button className="text-[8px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors">Clear</button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-1.5 space-y-1">
                {MOCK_NOTIFICATIONS.map(n => (
                    <div
                        key={n.id}
                        className={`p-3 flex gap-3 items-start transition-all rounded-xl cursor-pointer hover:bg-white/10 ${n.read ? 'opacity-40' : ''}`}
                    >
                        <div className="shrink-0 relative">
                            {n.user ? (
                                <img src={n.user.avatar} className="w-7 h-7 rounded-full border border-white/10 object-cover" />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                    <Star size={10} className="text-white" />
                                </div>
                            )}
                            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center border border-black text-[7px] ${n.type === 'LIKE' ? 'bg-red-500' :
                                n.type === 'COMMENT' ? 'bg-blue-500' :
                                    n.type === 'INVITE' ? 'bg-purple-500' : 'bg-white/20'
                                }`}>
                                {n.type === 'LIKE' && <Heart size={6} fill="white" />}
                                {n.type === 'COMMENT' && <MessageCircle size={6} />}
                                {n.type === 'INVITE' && <Calendar size={6} />}
                                {n.type === 'SYSTEM' && <Star size={6} />}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-[var(--text-primary)] leading-tight">
                                {n.user && <span className="text-[10px] font-black text-[var(--text-primary)] mr-1 uppercase">{n.user.name}</span>}
                                {n.text}
                            </p>
                            <span className="text-[7px] text-white/30 font-black uppercase tracking-widest mt-1 block">{n.time}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-2 border-t border-white/5">
                <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] transition-all text-white/30 hover:text-white">
                    View All Activity
                </button>
            </div>
        </motion.div>
    );
};

// --- VIBE WINDOW ---
export const VibeWindow: React.FC<{ isInsideProfile?: boolean }> = ({ isInsideProfile = false }) => {
    const { theme, setTheme } = useTheme();

    const Content = (
        <div className={`flex flex-col ${isInsideProfile ? 'p-0' : 'p-3 w-48'}`}>
            <div className="flex items-center mb-2 px-1">
                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Switch Mode</span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-black/20 p-1 rounded-xl border border-white/5">
                {[
                    { id: 'dusk', label: 'Dusk', icon: Moon },
                    { id: 'dawn', label: 'Dawn', icon: Zap },
                    { id: 'sunrise', label: 'Sunrise', icon: CloudSun }
                ].map((mode) => {
                    const Icon = mode.icon;
                    const isActive = theme === mode.id;
                    return (
                        <button
                            key={mode.id}
                            onClick={() => setTheme(mode.id as ThemeMode)}
                            className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all relative group/vibe ${isActive
                                    ? 'bg-white/10 text-[var(--text-primary)] shadow-sm'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="vibe-active"
                                    className="absolute inset-0 bg-white/10 rounded-lg border border-white/10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Icon
                                size={12}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover/vibe:scale-110 opacity-50 group-hover/vibe:opacity-100'}`}
                            />
                            <span className="relative z-10 text-[6px] font-black uppercase tracking-widest leading-none">{mode.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    if (isInsideProfile) {
        return (
            <div className="px-2 py-2 mb-1 bg-white/5 border border-white/10 rounded-xl">
                {Content}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mt-2 bg-[var(--bg-glass)] backdrop-blur-[80px] backdrop-contrast-[0.85] border border-[var(--border-glass)] rounded-[2rem] shadow-2xl overflow-hidden"
        >
            {Content}
        </motion.div>
    );
};

// --- PROFILE WINDOW ---
export const ProfileWindow: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { user, logout, refreshProfile, updateUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();

    // Auto-refresh profile data when menu opens to catch admin status changes
    useEffect(() => {
        refreshProfile();
    }, []);

    if (!user) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mt-2 p-1 w-44 bg-[var(--bg-glass)] backdrop-blur-[80px] backdrop-contrast-[0.85] border border-[var(--border-glass)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
            <div className="p-2.5 border-b border-white/5 flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden shadow-xl">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                            <User size={14} className="text-gray-500" />
                        </div>
                    )}
                </div>
                <div className="text-center">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-[var(--text-primary)] leading-tight">
                        {user.name || user.username || 'Aura Seeker'}
                    </h3>
                    <p className="text-[6px] font-black uppercase tracking-[0.2em] text-electric-teal mt-0.5">
                        {user.aura_points || 0} Aura Points
                    </p>
                    <button
                        onClick={() => refreshProfile()}
                        className="text-[5px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-1"
                    >
                        Sync Data
                    </button>
                </div>
            </div>

            <div className="p-0.5 space-y-0.5">
                {/* Atmosphere Switcher */}
                <VibeWindow isInsideProfile={true} />

                {/* Admin Role Switcher */}
                {user.is_admin && (
                    <div className="px-2 py-2 mb-1 bg-electric-teal/5 border border-white/5 rounded-xl">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Zap size={10} className="text-electric-teal" />
                            <span className="text-[7px] font-black uppercase tracking-widest text-white/50">God Mode</span>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => {
                                    updateUser({ is_operator: false });
                                    onClose();
                                }}
                                className={`flex-1 py-1.5 rounded-lg text-[7px] font-black uppercase tracking-wider transition-all ${!user.is_operator ? 'bg-primary text-black' : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'}`}
                            >
                                User
                            </button>
                            <button
                                onClick={() => {
                                    updateUser({ is_operator: true });
                                    onClose();
                                }}
                                className={`flex-1 py-1.5 rounded-lg text-[7px] font-black uppercase tracking-wider transition-all ${user.is_operator ? 'bg-electric-teal text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                            >
                                Brand
                            </button>
                        </div>
                    </div>
                )}

                {user.is_admin && (
                    <button
                        onClick={() => {
                            navigate('/app/admin');
                            onClose();
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-electric-teal/10 transition-all text-electric-teal group"
                    >
                        <Zap size={11} className="text-electric-teal/50 group-hover:text-electric-teal transition-colors" />
                        <span className="text-[8px] font-black uppercase tracking-wider">Admin Command</span>
                    </button>
                )}

                <button
                    onClick={() => {
                        navigate('/app/myprofile');
                        onClose();
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-all text-[var(--text-primary)] group"
                >
                    <User size={11} className="text-gray-500 group-hover:text-electric-teal transition-colors" />
                    <span className="text-[8px] font-black uppercase tracking-wider">My Profile</span>
                </button>
                <button
                    onClick={() => {
                        onClose();
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-all text-[var(--text-primary)] group"
                >
                    <Settings size={11} className="text-gray-500 group-hover:text-electric-teal transition-colors" />
                    <span className="text-[8px] font-black uppercase tracking-wider">Settings</span>
                </button>

                <div className="h-px bg-white/5 my-0.5 mx-2" />

                <div className="px-1">
                    <button
                        onClick={() => {
                            logout();
                            onClose();
                            navigate('/');
                        }}
                        className="w-full flex items-center gap-1.5 px-1.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-all text-red-500 group"
                    >
                        <LogOut size={11} className="text-red-500/50 group-hover:text-red-500 transition-colors" />
                        <span className="text-[7px] font-black uppercase tracking-[0.2em]">Logout</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// --- SEARCH WINDOW ---
export const SearchWindow: React.FC<{
    query: string,
    setSearchQuery: (q: string) => void,
    results: { quests: any[], brands: any[], people: any[], items: any[] },
    isSearching?: boolean;
    onClose: () => void
}> = ({ query, setSearchQuery, results, isSearching, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeFilter, setActiveFilter] = useState<'all' | 'people' | 'quests' | 'brands' | 'items'>('all');

    const [featured, setFeatured] = useState<{ brands: any[], quests: any[], people: any[], items: any[] }>({ brands: [], quests: [], people: [], items: [] });

    useEffect(() => {
        if (query.length < 2) {
            import('../../services/supabaseService').then(({ supabaseService }) => {
                supabaseService.search.getFeaturedContent().then(setFeatured);
            });
        }
    }, [query]);

    const hasResults = (results.quests?.length || 0) > 0 || (results.brands?.length || 0) > 0 || (results.people?.length || 0) > 0 || (results.items?.length || 0) > 0;

    const filterCounts = {
        all: (results.quests?.length || 0) + (results.brands?.length || 0) + (results.people?.length || 0) + (results.items?.length || 0),
        people: results.people?.length || 0,
        quests: results.quests?.length || 0,
        brands: results.brands?.length || 0,
        items: results.items?.length || 0
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="w-full bg-white/[0.14] backdrop-blur-[80px] backdrop-contrast-[0.85] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[520px]"
        >


            {/* Filter Tabs */}
            {query.length >= 2 && (
                <div className="px-3 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-white/5 bg-white/[0.02]">
                    {[
                        { id: 'all', label: 'All', icon: null, count: filterCounts.all },
                        { id: 'people', label: 'People', icon: User, count: filterCounts.people },
                        { id: 'quests', label: 'Quests', icon: Zap, count: filterCounts.quests },
                        { id: 'brands', label: 'Brands', icon: Star, count: filterCounts.brands },
                        { id: 'items', label: 'Dibs', icon: ShoppingBag, count: filterCounts.items },
                    ].map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id as any)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shrink-0 ${activeFilter === filter.id
                                ? 'bg-white text-black border-white'
                                : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:border-white/10'
                                }`}
                        >
                            {filter.icon && <filter.icon size={12} className={activeFilter === filter.id ? 'text-black' : 'text-white/40'} />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{filter.label}</span>
                            {filter.count !== undefined && (
                                <span className={`text-[9px] font-black ml-0.5 ${activeFilter === filter.id ? 'text-black/40' : 'text-white/20'}`}>
                                    {filter.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-4">
                {query.length < 2 ? (
                    <div className="p-2 space-y-5">
                        {/* Featured Brands — 2-col grid */}
                        {featured.brands.length > 0 && (
                            <section>
                                <div className="px-1 mb-2">
                                    <span className="text-[8px] font-black text-primary uppercase tracking-widest">Featured Brands</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {featured.brands.map(b => (
                                        <button
                                            key={b.user_id}
                                            onClick={() => { navigate(`/app/shop/${b.slug}`); onClose(); }}
                                            className="text-left p-2.5 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 bg-white/[0.04] border border-white/5 group"
                                        >
                                            <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden shrink-0">
                                                <img src={b.logo_url} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[9px] font-black text-white truncate leading-tight">{b.business_name}</h4>
                                                <p className="text-[7px] text-white/30 font-bold uppercase truncate mt-0.5">{b.category}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Hot Quests — 2-col grid */}
                        {featured.quests.length > 0 && (
                            <section>
                                <div className="px-1 mb-2">
                                    <span className="text-[8px] font-black text-electric-teal uppercase tracking-widest">Hot Quests</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {featured.quests.map(q => (
                                        <button
                                            key={q.id}
                                            onClick={() => {
                                                const params = new URLSearchParams(location.search);
                                                params.set('quest', q.id);
                                                navigate({
                                                    pathname: location.pathname,
                                                    search: params.toString()
                                                });
                                                onClose();
                                            }}
                                            className="text-left p-2.5 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 bg-white/[0.04] border border-white/5 group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-electric-teal/10 border border-electric-teal/20 flex items-center justify-center shrink-0">
                                                <Zap size={13} className="text-electric-teal" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[9px] font-black text-white truncate leading-tight">{q.title}</h4>
                                                <p className="text-[7px] text-white/30 font-bold uppercase truncate mt-0.5">{q.aura_reward} Aura</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Hot Items — 2-col grid */}
                        {featured.items?.length > 0 && (
                            <section>
                                <div className="px-1 mb-2">
                                    <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest">Hot Items</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {featured.items.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                navigate(`/app/dibs?item=${item.id}`);
                                                onClose();
                                            }}
                                            className="text-left rounded-xl overflow-hidden hover:ring-1 hover:ring-white/20 transition-all bg-white/[0.04] border border-white/5 group"
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-full h-16 overflow-hidden relative">
                                                {item.image_url ? (
                                                    <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                ) : (
                                                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                                        <ShoppingBag size={16} className="text-white/20" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[7px] font-black text-orange-300">₱{item.price?.toLocaleString()}</span>
                                            </div>
                                            {/* Info */}
                                            <div className="p-2">
                                                <h4 className="text-[9px] font-black text-white truncate leading-tight">{item.title}</h4>
                                                <p className="text-[7px] text-white/30 font-bold uppercase truncate mt-0.5">{item.category}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Top People — keep as list */}
                        {featured.people.length > 0 && (
                            <section>
                                <div className="px-1 mb-2">
                                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Top People</span>
                                </div>
                                <div className="space-y-1">
                                    {featured.people.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                navigate(`/app/${p.id}`);
                                                onClose();
                                            }}
                                            className="w-full text-left p-2 rounded-xl hover:bg-white/10 transition-all flex items-center gap-3"
                                        >
                                            <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden shrink-0">
                                                <img src={p.avatar_url || `https://ui-avatars.com/api/?name=${p.username}`} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[10px] font-black text-white truncate">{p.username}</h4>
                                                <p className="text-[7px] text-white/40 font-black uppercase truncate mt-0.5">{p.aura_points} Aura • Level {p.level}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                ) : isSearching ? (
                    <div className="py-20 text-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
                        />
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Searching...</p>
                    </div>
                ) : (
                    <>
                        {/* Empty state for search */}
                        {activeFilter === 'all' && !hasResults && (
                            <div className="py-20 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                                    <Search size={20} className="text-white/10" />
                                </div>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                                    No matches found for "{query}"
                                </p>
                            </div>
                        )}

                        {(activeFilter !== 'all' && filterCounts[activeFilter as keyof typeof filterCounts] === 0) ? (
                            <div className="py-20 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                                    <Search size={20} className="text-white/10" />
                                </div>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                                    No {activeFilter} found
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* PEOPLE */}
                                {(activeFilter === 'all' || activeFilter === 'people') && results.people.length > 0 && (
                                    <section>
                                        <div className="px-3 mb-2">
                                            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">People</span>
                                        </div>
                                        <div className="space-y-1">
                                            {results.people.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => {
                                                        navigate(`/app/${p.id}`);
                                                        onClose();
                                                    }}
                                                    className="w-full text-left p-3 rounded-xl hover:bg-white/10 transition-all group flex items-center gap-3"
                                                >
                                                    <div className="w-10 h-10 rounded-full border border-white/10 bg-zinc-900 overflow-hidden shrink-0">
                                                        {p.avatar_url ? (
                                                            <img src={p.avatar_url} className="w-full h-full object-cover" />
                                                        ) : <User size={14} className="text-white/20" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[11px] font-black text-white truncate">{p.name || p.username}</h4>
                                                        <p className="text-[8px] text-white/40 font-black uppercase truncate mt-0.5">
                                                            Level {p.level || 1} • {p.aura_points || 0} Aura
                                                        </p>
                                                    </div>
                                                    <div className="px-2 py-0.5 rounded bg-white/5 text-[7px] font-black text-white/30 uppercase">Profile</div>
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* QUESTS */}
                                {(activeFilter === 'all' || activeFilter === 'quests') && results.quests.length > 0 && (
                                    <section>
                                        <div className="px-3 mb-2 flex items-center justify-between">
                                            <span className="text-[8px] font-black text-electric-teal uppercase tracking-widest">Quests</span>
                                        </div>
                                        <div className="space-y-1">
                                            {results.quests.map(q => (
                                                <button
                                                    key={q.id}
                                                    onClick={() => {
                                                        const params = new URLSearchParams(location.search);
                                                        params.set('quest', q.id);
                                                        navigate({
                                                            pathname: location.pathname,
                                                            search: params.toString()
                                                        });
                                                        onClose();
                                                    }}
                                                    className="w-full text-left p-3 rounded-xl hover:bg-white/10 transition-all group flex items-center gap-3"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                                        {q.host?.avatar_url ? (
                                                            <img src={q.host.avatar_url} className="w-full h-full object-cover" />
                                                        ) : <Zap size={16} className="text-white/20" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[11px] font-black text-white truncate">{q.title}</h4>
                                                        <p className="text-[8px] text-white/40 font-black uppercase truncate mt-0.5">
                                                            {q.location?.place_name || 'Global'} • {q.aura_reward} Aura
                                                        </p>
                                                    </div>
                                                    <ArrowRight size={12} className="text-white/0 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* BRANDS / OPERATORS */}
                                {(activeFilter === 'all' || activeFilter === 'brands') && results.brands.length > 0 && (
                                    <section>
                                        <div className="px-3 mb-2">
                                            <span className="text-[8px] font-black text-primary uppercase tracking-widest">Brands</span>
                                        </div>
                                        <div className="space-y-1">
                                            {results.brands.map(b => (
                                                <button
                                                    key={b.user_id}
                                                    onClick={() => {
                                                        navigate(`/app/shop/${b.slug}`);
                                                        onClose();
                                                    }}
                                                    className="w-full text-left p-3 rounded-xl hover:bg-white/10 transition-all group flex items-center gap-3"
                                                >
                                                    <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden shrink-0">
                                                        <img src={b.logo_url} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1">
                                                            <h4 className="text-[11px] font-black text-white truncate">{b.business_name}</h4>
                                                            {b.is_verified && <Star size={8} className="text-primary fill-primary" />}
                                                        </div>
                                                        <p className="text-[8px] text-white/40 font-black uppercase truncate mt-0.5">
                                                            {b.category} • {b.location_text}
                                                        </p>
                                                    </div>
                                                    <ArrowRight size={12} className="text-white/0 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* ITEMS */}
                                {(activeFilter === 'all' || activeFilter === 'items') && (results.items?.length || 0) > 0 && (
                                    <section>
                                        <div className="px-3 mb-2">
                                            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Shop</span>
                                        </div>
                                        <div className="space-y-1">
                                            {results.items.map(item => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => {
                                                        navigate(`/app/dibs?item=${item.id}`);
                                                        onClose();
                                                    }}
                                                    className="w-full text-left p-3 rounded-xl hover:bg-white/10 transition-all group flex items-center gap-3"
                                                >
                                                    <div className="w-10 h-10 rounded-lg border border-white/10 bg-zinc-900 overflow-hidden shrink-0">
                                                        {item.image_url ? (
                                                            <img src={item.image_url} className="w-full h-full object-cover" />
                                                        ) : <ShoppingBag size={14} className="text-white/20" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[11px] font-black text-white truncate">{item.title}</h4>
                                                        <p className="text-[8px] text-white/40 font-black uppercase truncate mt-0.5">
                                                            ₱{item.price?.toLocaleString()} • {item.category}
                                                        </p>
                                                    </div>
                                                    <div className="px-2 py-0.5 rounded bg-primary/10 text-[7px] font-black text-primary uppercase">Dibs</div>
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </motion.div >
    );
};

export default ProfileWindow;
