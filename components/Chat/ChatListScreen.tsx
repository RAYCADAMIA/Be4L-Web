import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, Zap } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';
import { Message, User as UserType } from '../../types';
import TopBar from '../TopBar';

import { HeartbeatTransition, FloatingTabs } from '../ui/AestheticComponents';

interface ChatListScreenProps {
    onOpenChat: (chatId: string, name: string) => void;
    onBack?: () => void;
    onOpenProfile: () => void;
    currentUser: UserType;
    onNavigate: (tab: 'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS') => void;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({ onOpenChat, onBack, onOpenProfile, currentUser, onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'ECHOES' | 'LOBBIES'>('ECHOES');
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Scroll Logic for Sync Top Bar
    const [topBarY, setTopBarY] = useState(0);
    const lastScrollY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastClickTimeRef = useRef(0);

    const handleLogoClick = () => {
        const now = Date.now();
        if (now - lastClickTimeRef.current < 300) {
            onNavigate('LANDING');
        } else {
            containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
        lastClickTimeRef.current = now;
    };

    const handleScroll = () => {
        const currentScrollY = containerRef.current?.scrollTop || 0;
        const delta = currentScrollY - lastScrollY.current;

        if (currentScrollY > 10) {
            setTopBarY(prev => {
                const newY = prev - delta;
                return Math.max(-80, Math.min(0, newY));
            });
        } else {
            setTopBarY(0);
        }

        lastScrollY.current = currentScrollY;
    };

    useEffect(() => {
        const loadChats = async () => {
            setLoading(true);
            const data = await supabaseService.chat.getChats();
            // Filter logic: Lobbies are explicitly type 'lobby' or have context
            const echoes = data.filter((c: any) => c.type === 'personal' || c.context_type === 'NONE');
            const lobbies = data.filter((c: any) => c.type === 'lobby' || c.context_type === 'QUEST' || c.context_type === 'SQUAD');

            // Artificial delay
            setTimeout(() => {
                setChats(activeTab === 'ECHOES' ? echoes : lobbies);
                setLoading(false);
            }, 500);
        };
        loadChats();
    }, [activeTab]);

    return (
        <div className="flex-1 h-full relative flex flex-col overflow-hidden">
            <TopBar
                translateY={topBarY}
                onOpenProfile={onOpenProfile}
                user={currentUser}
                onLogoClick={handleLogoClick}
                onSearchClick={() => onNavigate('SEARCH')}
                onNotificationsClick={() => onNavigate('NOTIFICATIONS')}
            />


            {/* FLOATING TABS (Sticky/Fixed like Lore Feed) */}
            <motion.div
                animate={{ y: topBarY }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="absolute top-[80px] left-0 right-0 z-30 flex items-center justify-center pt-2 pointer-events-none"
            >
                <FloatingTabs
                    activeTab={activeTab}
                    onChange={(val) => setActiveTab(val as 'ECHOES' | 'LOBBIES')}
                    tabs={[
                        { label: 'Echoes', value: 'ECHOES' },
                        { label: 'Lobbies', value: 'LOBBIES' }
                    ]}
                />
            </motion.div>

            {/* List */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto pt-[150px] pb-14 space-y-2 px-4 no-scrollbar flex flex-col"
            >

                <HeartbeatTransition loading={loading} label={activeTab === 'ECHOES' ? "Finding Friends..." : "Opening Lobbies..."}>
                    {chats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <span className="text-gray-600 font-bold uppercase text-[10px] tracking-widest mb-2">Silence is golden</span>
                            <p className="text-white/40 text-xs italic">{activeTab === 'ECHOES' ? 'Start a convo with a friend.' : 'Join a quest to enter a lobby.'}</p>
                        </div>
                    ) : chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => onOpenChat(chat.id, chat.name)}
                            className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-white/5 active:bg-surface transition-colors cursor-pointer group"
                        >
                            <div className="relative">
                                <div className={`w-14 h-14 rounded-full overflow-hidden border-2 ${activeTab === 'LOBBIES' ? 'border-primary/20 p-1' : 'border-transparent'} group-hover:border-primary transition-all`}>
                                    <img src={chat.avatar} alt={chat.name} className="w-full h-full rounded-full object-cover" />
                                </div>
                                {chat.unread > 0 && <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold text-black">{chat.unread}</div>}
                                {activeTab === 'LOBBIES' && (
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black border border-white/10 rounded-full flex items-center justify-center text-primary">
                                        <Zap size={10} strokeWidth={3} className="fill-current" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-bold text-white truncate pr-2 text-base uppercase tracking-tighter italic">{chat.name}</h3>
                                    <span className="text-[10px] font-bold text-gray-600 whitespace-nowrap uppercase">{chat.time}</span>
                                </div>
                                <p className={`text-sm truncate ${chat.unread > 0 ? 'text-white font-medium' : 'text-gray-500'}`}>
                                    {chat.lastMsg}
                                </p>
                            </div>
                        </div>
                    ))}
                </HeartbeatTransition>
            </div>
        </div>
    );
};

export default ChatListScreen;
