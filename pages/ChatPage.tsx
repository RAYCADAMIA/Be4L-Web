import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ChatListScreen from '../components/Chat/ChatListScreen';
import ChatDetailScreen from '../components/Chat/ChatDetailScreen';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Info, ChevronRight, X } from 'lucide-react';

export const ChatPage: React.FC = () => {
    useDocumentTitle('Messages');
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchParams, setSearchParams] = useSearchParams();
    const activeChatId = searchParams.get('id');
    const activeChatName = searchParams.get('name') || 'Echo';
    const [showInfo, setShowInfo] = useState(false);

    // Auto-open chat if passed in location state (e.g. from joining a quest)
    useEffect(() => {
        const state = location.state as { openChatId?: string; openChatName?: string } | null;
        if (state?.openChatId) {
            setSearchParams({ id: state.openChatId, name: state.openChatName || 'Echo' });
        }
    }, [location, setSearchParams]);

    if (!user) return null;

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
                            <div className="flex flex-col items-center justify-center opacity-20 pointer-events-none p-12 text-center">
                                <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                                    <Search size={40} className="text-gray-500" />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Select a frequency</h2>
                                <p className="text-xs font-bold text-gray-400 max-w-xs">Your echoes and lobbies will appear here when selected.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </main>

                {/* Panel 3: Chat Info (Right - Desktop Only) */}
                <AnimatePresence>
                    {showInfo && activeChatId && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 350, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="hidden xl:flex h-full border-l border-white/5 flex-col shrink-0 overflow-y-auto no-scrollbar bg-black/40 backdrop-blur-3xl"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Context Info</h3>
                                    <button onClick={() => setShowInfo(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="flex flex-col items-center text-center mb-12">
                                    <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 p-1 border border-white/10 mb-6 group relative">
                                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="w-full h-full rounded-[2.2rem] bg-zinc-800 overflow-hidden relative z-10" />
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tighter uppercase mb-2">{activeChatName}</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Active Session</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4 text-center">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Shared Lore</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[1, 2, 3, 4, 5, 6].map(i => (
                                                <div key={i} className="aspect-square rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all cursor-pointer overflow-hidden group">
                                                    <div className="w-full h-full bg-zinc-900 group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                            ))}
                                        </div>
                                        <button className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center justify-center gap-1 w-full mt-2 hover:gap-2 transition-all">
                                            View Vault <ChevronRight size={10} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
