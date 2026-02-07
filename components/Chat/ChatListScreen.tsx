import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, Zap, MessageCircle, Users, Plus } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';
import { Message, User as UserType } from '../../types';
import TopBar from '../TopBar';

import { HeartbeatTransition } from '../ui/AestheticComponents';
import { useNavigation } from '../../contexts/NavigationContext';
import { useScrollBehavior } from '../../hooks/useScrollBehavior';
import { ChatSidebar, ChatHeader } from './ChatFilters';

interface ChatListScreenProps {
    onOpenChat: (chatId: string, name: string) => void;
    onBack?: () => void;
    onOpenProfile: () => void;
    currentUser: UserType;
    onNavigate: (tab: 'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS') => void;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({ onOpenChat, onBack, onOpenProfile, currentUser, onNavigate }) => {
    const { setTabs, activeTab, setActiveTab } = useNavigation();
    const [activeCat, setActiveCat] = useState('All');
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { headerSpringY } = useNavigation();
    const { handleScroll } = useScrollBehavior();

    const containerRef = useRef<HTMLDivElement>(null);

    // Register Tabs
    useEffect(() => {
        // We no longer set global tabs. Sidebar handles it locally.
        // setTabs([...]);

        if (!activeTab || (activeTab !== 'ECHOES' && activeTab !== 'LOBBIES')) {
            setActiveTab('ECHOES');
        }
        setTabs([]); // Ensure global tabs are cleared

        return () => setTabs([]);
    }, []);

    useEffect(() => {
        setActiveCat('All');
    }, [activeTab]);

    useEffect(() => {
        const loadChats = async () => {
            setLoading(true);
            let data = await supabaseService.chat.getChats(currentUser.id);

            // Filter logic: Lobbies are explicitly type 'lobby' or have context
            let echoes = data.filter((c: any) => c.type === 'personal' || c.context_type === 'NONE');
            let lobbies = data.filter((c: any) => c.type === 'lobby' || c.context_type === 'QUEST' || c.context_type === 'SQUAD');

            // Fallback to MOCK_CHATS as samples if no data found
            if (data.length === 0) {
                const { MOCK_CHATS } = await import('../../services/supabaseService');
                echoes = MOCK_CHATS.filter(c => c.type === 'personal');
                lobbies = MOCK_CHATS.filter(c => c.type === 'lobby');
            }

            let filtered = activeTab === 'ECHOES' ? echoes : lobbies;

            // Apply category filter
            if (activeCat === 'Unread') {
                filtered = filtered.filter(c => c.unread > 0);
            } else if (activeCat === 'Groups' && activeTab === 'ECHOES') {
                filtered = filtered.filter(c => c.type === 'group');
            }

            // Artificial delay
            setTimeout(() => {
                setChats(filtered);
                setLoading(false);
            }, 500);
        };
        loadChats();
    }, [activeTab, activeCat]);

    const handleCreateGroup = async () => {
        const groupName = prompt("Enter Squad Name:");
        if (!groupName) return;

        // In a real app, this would involve selecting members, but for MVP:
        const { data: newChat } = await supabaseService.chat.createGroup(currentUser.id, groupName);
        if (newChat) {
            onOpenChat(newChat.id, newChat.name);
        }
    };

    // Simplified state to match the UI: 'All' | 'Unread' | 'Lobbies'
    const [activeHeading, setActiveHeading] = useState('All');

    // Sync complex state with simplified UI state
    useEffect(() => {
        if (activeHeading === 'Lobbies') {
            setActiveTab('LOBBIES');
        } else {
            setActiveTab('ECHOES');
            setActiveCat(activeHeading);
        }
    }, [activeHeading, setActiveTab]);

    return (
        <div className="flex-1 flex flex-col h-full bg-transparent">
            <div
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col"
            >
                {/* Header Spacer for Floating Nav - 75px to clear logo & menu area perfectly */}
                <div className="h-[88px] w-full shrink-0" />
                {/* Fixed Header Container - Changed to relative to follow scroll spacer */}
                <div className="md:hidden relative z-30 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pointer-events-auto"
                    >
                        {/* Search Bar Integrated into Header for Mobile */}
                        <div className="pt-2 px-6 pb-2">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="relative flex-1 group">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-electric-teal transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search comms..."
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-[11px] font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-electric-teal/50 focus:bg-white/[0.05] transition-all uppercase tracking-wide"
                                    />
                                </div>
                                <button
                                    onClick={handleCreateGroup}
                                    className="w-11 h-11 shrink-0 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center active:scale-95 shadow-lg"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="pb-0">
                            <ChatHeader
                                activeHeading={activeHeading}
                                setActiveHeading={setActiveHeading}
                            />
                        </div>
                    </motion.div>
                </div>
                {/* Reduced Gap between filters and list */}
                <div className="md:hidden h-4 w-full shrink-0" />

                {/* Filter Pills - Desktop Only */}
                <div className="hidden md:flex px-4 pb-4 gap-2">
                    {['All', 'Unread', 'Lobbies'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveHeading(filter)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${activeHeading === filter
                                ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                                : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Chat List */}
                <div className="px-4 space-y-2 pb-32">
                    <HeartbeatTransition loading={loading} label="Tuning Frequency...">
                        {chats.length === 0 ? (
                            <div className="py-20 text-center opacity-20">
                                <MessageCircle size={40} className="mx-auto mb-4" />
                                <p className="text-xs font-bold uppercase tracking-widest">No signals found</p>
                            </div>
                        ) : (
                            chats.map(chat => (
                                <motion.div
                                    whileHover={{ x: 4 }}
                                    key={chat.id}
                                    onClick={() => onOpenChat(chat.id, chat.name)}
                                    className="flex items-center gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer group"
                                >
                                    <div className="relative">
                                        <div className={`w-12 h-12 rounded-[1.4rem] overflow-hidden border border-white/10 p-0.5 bg-black`}>
                                            <img src={chat.avatar} alt={chat.name} className="w-full h-full rounded-[1.2rem] object-cover" />
                                        </div>
                                        {chat.unread > 0 && (
                                            <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-electric-teal rounded-full border-2 border-black flex items-center justify-center px-0.5">
                                                <span className="text-[9px] font-black text-black">{chat.unread}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h3 className="text-sm font-black text-white group-hover:text-electric-teal transition-colors tracking-tight uppercase truncate">
                                                <span className="animate-liquid-text">
                                                    {chat.name}
                                                </span>
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{chat.time}</span>
                                            </div>
                                        </div>
                                        <p className={`text-[11px] truncate ${chat.unread > 0 ? 'text-white font-bold' : 'text-gray-500 font-medium'}`}>
                                            {chat.lastMsg}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </HeartbeatTransition>
                </div>
            </div>
        </div>
    );
};


export default ChatListScreen;
