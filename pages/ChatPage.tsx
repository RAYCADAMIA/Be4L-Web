import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, Shield, Trash2, UserMinus, Plus, ChevronRight, Settings, Users, Ban, AlertTriangle, LogOut, RefreshCw, MapPin, MoreHorizontal, Zap } from 'lucide-react';
import { useToast } from '../components/Toast';
import ChatListScreen from '../components/Chat/ChatListScreen';
import ChatDetailScreen from '../components/Chat/ChatDetailScreen';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatGuestTeaser } from '../components/Chat/ChatGuestTeaser';

export const ChatPage: React.FC = () => {
    useDocumentTitle('Messages');
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchParams, setSearchParams] = useSearchParams();
    const activeChatId = searchParams.get('id');
    const activeChatName = searchParams.get('name') || 'Echo';
    const [showInfo, setShowInfo] = useState(false);
    const [showCitySwitcher, setShowCitySwitcher] = useState(false);
    const { showToast } = useToast();

    // Auto-open chat if passed in location state (e.g. from joining a quest)
    useEffect(() => {
        const state = location.state as { openChatId?: string; openChatName?: string } | null;
        if (state?.openChatId) {
            setSearchParams({ id: state.openChatId, name: state.openChatName || 'Echo' });
        }
    }, [location, setSearchParams]);

    // If guest, we pass a dummy user or handle null in ChatListScreen

    return (
        <div className="flex flex-1 h-full w-full overflow-hidden bg-transparent">
            {/* 3-Panel Composition */}
            <div className="flex h-full w-full max-w-[1700px] mx-auto relative">

                {/* Panel 1: Chat List (Left) */}
                <aside className={`
                    ${activeChatId ? 'hidden md:flex' : 'flex'}
                    w-full md:w-[350px] lg:w-[400px] h-full border-r border-white/5 flex-col shrink-0
                `}>
                    <ChatListScreen
                        onOpenChat={(id, name) => {
                            setSearchParams({ id, name });
                        }}
                        onOpenProfile={() => navigate('/app/myprofile')}
                        currentUser={user}
                        onNavigate={(tab) => {
                            if (tab === 'HOME') navigate('/app/home');
                            if (tab === 'QUESTS') navigate('/app/quests');
                            if (tab === 'DIBS' || tab === 'BOOK') navigate('/app/dibs');
                        }}
                    />
                </aside>

                {/* Panel 2: Chat Detail (Center) */}
                <main className={`
                    ${activeChatId ? 'flex' : 'hidden md:flex items-center justify-center'}
                    flex-1 h-full relative overflow-hidden bg-black/20
                `}>
                    <AnimatePresence mode="wait">
                        {activeChatId ? (
                            <motion.div
                                key={activeChatId}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full h-full"
                            >
                                <ChatDetailScreen
                                    chatId={activeChatId}
                                    chatName={activeChatName}
                                    onBack={() => setSearchParams({})}
                                    onLaunchCamera={() => { }}
                                    onToggleInfo={() => setShowInfo(!showInfo)}
                                />
                            </motion.div>
                        ) : (
                            user ? (
                                <div className="flex-1 h-full flex flex-col items-center justify-center opacity-20 pointer-events-none">
                                    {/* Empty Canvas for Logged In Users */}
                                </div>
                            ) : (
                                <ChatGuestTeaser />
                            )
                        )}
                    </AnimatePresence>
                </main>

                {/* Panel 3: Chat Info (Right - Slide-over/Aside) */}
                <AnimatePresence>
                    {showInfo && activeChatId && (
                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-0 z-[110] md:relative md:inset-auto md:w-[350px] lg:w-[400px] h-full border-l border-white/5 flex flex-col overflow-y-auto no-scrollbar bg-black/90 md:bg-black/40 backdrop-blur-3xl"
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-black/40 backdrop-blur-xl z-20">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Chat Info</h3>
                                <button onClick={() => setShowInfo(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-12">
                                {/* Profile / Identity Section */}
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 p-1 border border-white/10 mb-6 group relative">
                                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="w-full h-full rounded-[2.2rem] bg-zinc-800 overflow-hidden relative z-10 flex items-center justify-center">
                                            {activeChatName.includes('City') || activeChatName.includes('Global') ? (
                                                <Users size={32} className="text-primary" />
                                            ) : (
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeChatName)}&background=random`}
                                                    className="w-full h-full object-cover"
                                                    alt="identity"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tighter uppercase mb-2 text-white">{activeChatName}</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Active Channel</p>
                                </div>

                                {/* Actions Section */}
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4 px-2">Actions</p>

                                    {activeChatId?.startsWith('global') || activeChatId?.startsWith('city') ? (
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => {
                                                    if (activeChatId?.startsWith('city')) setShowCitySwitcher(!showCitySwitcher);
                                                }}
                                                className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-all text-white font-bold group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                                                    {activeChatId?.startsWith('city') ? <RefreshCw size={18} /> : <LogOut size={18} />}
                                                </div>
                                                <div className="text-left flex-1">
                                                    <span className="block text-sm uppercase tracking-tight">{activeChatId?.startsWith('city') ? 'Switch City' : 'Leave Global'}</span>
                                                </div>
                                                {activeChatId?.startsWith('city') && <ChevronRight size={16} className={`text-white/20 transition-transform ${showCitySwitcher ? 'rotate-90' : ''}`} />}
                                            </button>

                                            <AnimatePresence>
                                                {showCitySwitcher && activeChatId?.startsWith('city') && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden space-y-2 mt-2 px-2"
                                                    >
                                                        {['Manila', 'Cebu', 'Davao'].map(city => (
                                                            <button
                                                                key={city}
                                                                onClick={() => {
                                                                    const cityKey = city.toLowerCase();
                                                                    const lastSwitch = localStorage.getItem('be4l_last_city_switch');
                                                                    const switchData = lastSwitch ? JSON.parse(lastSwitch) : null;

                                                                    if (switchData && activeChatName.toLowerCase().includes(switchData.city) && cityKey !== switchData.city) {
                                                                        const diff = Date.now() - switchData.timestamp;
                                                                        const threeDays = 3 * 24 * 60 * 60 * 1000;
                                                                        if (diff < threeDays) {
                                                                            const daysLeft = Math.ceil((threeDays - diff) / (24 * 60 * 60 * 1000));
                                                                            showToast(`Frequency locked. You can relocate again in ${daysLeft} days.`, 'warning');
                                                                            return;
                                                                        }
                                                                    }

                                                                    localStorage.setItem('be4l_last_city_switch', JSON.stringify({
                                                                        city: cityKey,
                                                                        timestamp: Date.now()
                                                                    }));
                                                                    setSearchParams({ id: `city-${cityKey}`, name: `${city} City` });
                                                                    setShowCitySwitcher(false);
                                                                    showToast(`Frequency updated to ${city}. Stay tuned.`, 'info');
                                                                }}
                                                                className={`w-full p-3 rounded-xl flex items-center justify-between text-[11px] font-black uppercase tracking-widest transition-all ${activeChatName.includes(city) ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-white/5 text-white/40 hover:bg-white/10 border border-transparent'}`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <MapPin size={12} className={activeChatName.includes(city) ? 'text-primary' : 'text-white/20'} />
                                                                    {city}
                                                                </div>
                                                                {activeChatName.includes(city) && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ) : activeChatId.includes('lobby') || activeChatId.includes('quest') ? (
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => {
                                                    const qid = activeChatId.replace('lobby-', '').replace('quest-', '');
                                                    window.dispatchEvent(new CustomEvent('open-quest-overlay', { detail: { id: qid } }));
                                                }}
                                                className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-all text-white font-bold group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <Zap size={18} />
                                                </div>
                                                <div className="text-left">
                                                    <span className="block text-sm uppercase tracking-tight">View Mission Details</span>
                                                    <span className="block text-[10px] text-white/40 font-medium tracking-tight">Access original quest parameters</span>
                                                </div>
                                            </button>

                                            <button className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-all text-white font-bold group">
                                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                                                    <LogOut size={18} />
                                                </div>
                                                <div className="text-left">
                                                    <span className="block text-sm uppercase tracking-tight">Leave Quest Chat</span>
                                                    <span className="block text-[10px] text-white/40 font-medium">Exit this mission lobby</span>
                                                </div>
                                            </button>
                                        </div>
                                    ) : (
                                        /* DM Actions */
                                        <div className="grid grid-cols-1 gap-3">
                                            <button className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-all text-white font-bold group">
                                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                                    <Trash2 size={18} />
                                                </div>
                                                <div className="text-left">
                                                    <span className="block text-sm uppercase tracking-tight">Delete Chat</span>
                                                    <span className="block text-[10px] text-white/40 font-medium font-medium">Wipe this history permanently</span>
                                                </div>
                                            </button>
                                            <button className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-all text-white font-bold group">
                                                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
                                                    <Ban size={18} />
                                                </div>
                                                <div className="text-left">
                                                    <span className="block text-sm uppercase tracking-tight">Block User</span>
                                                    <span className="block text-[10px] text-white/40 font-medium">Cut all signals forever</span>
                                                </div>
                                            </button>
                                            <button className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-all text-white font-bold group">
                                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                                    <AlertTriangle size={18} />
                                                </div>
                                                <div className="text-left">
                                                    <span className="block text-sm uppercase tracking-tight">Report</span>
                                                    <span className="block text-[10px] text-white/40 font-medium">Notify command of violations</span>
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Members Section (For non-DMs) */}
                                {!(activeChatId.length < 10 && !activeChatId.includes('-')) && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Members</p>
                                            <span className="text-[9px] font-black text-primary px-2 py-1 bg-primary/10 rounded-md">8 ACTIVE</span>
                                        </div>
                                        <div className="space-y-2">
                                            {(activeChatId?.startsWith('global') ?
                                                [
                                                    { id: 'be4l-official', name: 'Be4L', handle: '@be4l', role: 'Official', status: 'online', avatar: '/logo.png' },
                                                    { name: 'Sarah J', role: 'Elite', status: 'online' },
                                                    { name: 'Marcus', role: 'Member', status: 'online' },
                                                    { name: 'Kael', role: 'Member', status: 'offline' }
                                                ] : [
                                                    { name: 'Sarah J', role: 'Leader', status: 'online' },
                                                    { name: 'Marcus', role: 'Elite', status: 'online' },
                                                    { name: 'Kael', role: 'Member', status: 'offline' },
                                                    { name: 'Luna', role: 'Member', status: 'online' }
                                                ]
                                            ).map((member: any, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => {
                                                        const id = member.id || `u${i + 2}`;
                                                        window.dispatchEvent(new CustomEvent('open-profile-overlay', { detail: id }));
                                                    }}
                                                    className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group cursor-pointer"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-zinc-800 overflow-hidden border border-white/10 shrink-0">
                                                        <img src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1 truncate">
                                                            {member.name} {member.handle && <span className="text-[10px] text-white/30 font-medium ml-1 lowercase">{member.handle}</span>}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{member.role}</p>
                                                    </div>
                                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${member.status === 'online' ? 'bg-primary shadow-[0_0_8px_rgba(45,212,191,0.5)]' : 'bg-white/10'}`} />
                                                </div>
                                            ))}
                                        </div>
                                        <button className="text-[9px] font-black uppercase tracking-widest text-white/20 flex items-center justify-center gap-1 w-full mt-4 hover:text-white transition-all">
                                            View all members <ChevronRight size={10} />
                                        </button>
                                    </div>
                                )}

                                {/* Shared Media Placeholder */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 px-2">Shared Lore</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[1, 2, 3, 4, 5, 6].map(i => (
                                            <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all cursor-pointer overflow-hidden group">
                                                <div className="w-full h-full bg-zinc-900 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
                                                    <Plus size={14} className="text-white/10 group-hover:text-primary transition-colors" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
};
