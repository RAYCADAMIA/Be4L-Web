import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, Zap, MessageCircle, Users, Plus, mapPin, Globe, Lock, MapPin, Sparkles } from 'lucide-react';
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
        if (!activeTab || (activeTab !== 'WORLD' && activeTab !== 'QUEST' && activeTab !== 'PRIVATE')) {
            setActiveTab('WORLD');
        }
        setTabs([]);
        return () => setTabs([]);
    }, []);

    useEffect(() => {
        setActiveCat('All');
    }, [activeTab]);

    useEffect(() => {
        const loadChats = async () => {
            setLoading(true);
            if (!currentUser) {
                setChats([]);
                setLoading(false);
                return;
            }
            let data = await supabaseService.chat.getChats(currentUser.id);

            // Filter logic for 6-Tier System
            const worldChats = data.filter((c: any) => ['GLOBAL', 'CITY', 'BRAND'].includes(c.type));
            const questChats = data.filter((c: any) => c.context_type === 'QUEST' || (c.type === 'lobby' && c.context_type === 'QUEST'));
            const privateChats = data.filter((c: any) => ['SQUAD', 'personal', 'group', 'DM'].includes(c.type) || (c.type === 'personal'));

            // Fallback to MOCK_CHATS if empty (for MVP demo)
            if (data.length === 0) {
                const { MOCK_CHATS } = await import('../../services/supabaseService');
                // Auto-seed a Global Chat if none exists in mock
                if (!worldChats.find((c: any) => c.type === 'GLOBAL')) {
                    worldChats.push({ id: 'global-1', type: 'GLOBAL', name: 'Global Lobby', lastMsg: 'User123: Hello World!', time: 'Live', unread: 0, avatar: 'https://cdn-icons-png.flaticon.com/512/921/921591.png' });
                }
                if (!worldChats.find((c: any) => c.type === 'CITY')) {
                    worldChats.push({ id: 'city-dvo', type: 'CITY', name: 'Davao City', lastMsg: 'Anyone at People Park?', time: 'Live', unread: 5, avatar: 'https://ui-avatars.com/api/?name=Davao&background=random' });
                }
            }

            let filtered = [];
            if (activeTab === 'WORLD') filtered = worldChats;
            else if (activeTab === 'QUEST') filtered = questChats;
            else filtered = privateChats;

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

    const handleJoinCity = async () => {
        const city = prompt("Enter city name to switch (Mock):", "Manila");
        if (city) {
            // Mock switch
            alert(`Switching to ${city}... (3 Day Cooldown started)`);
        }
    };

    // Sub-filter logic (optional, keeping 'All' and 'Unread')
    const [activeHeading, setActiveHeading] = useState('All');

    useEffect(() => {
        setActiveCat(activeHeading);
    }, [activeHeading]);

    return (
        <div className="flex-1 flex flex-col h-full bg-transparent">
            <div
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col"
            >
                {/* Header Spacer for Floating Nav - 75px to clear logo & menu area perfectly */}
                <div className="h-[88px] w-full shrink-0" />
                {/* Mobile Search & Controls */}
                {currentUser && (
                    <div className="md:hidden pt-2 px-6 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 group">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-electric-teal transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
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
                )}

                {/* Major Tabs System */}
                {currentUser && (
                    <div className="px-6 mb-4">
                        <div className="flex gap-2 p-1.5 bg-white/[0.03] border border-white/5 rounded-[2rem] backdrop-blur-3xl">
                            {[
                                { id: 'WORLD', label: 'World', icon: Globe },
                                { id: 'QUEST', label: 'Quest', icon: Zap },
                                { id: 'PRIVATE', label: 'Private', icon: Lock }
                            ].map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            flex-1 flex flex-col items-center justify-center py-2.5 rounded-[1.4rem] transition-all duration-500 relative overflow-hidden
                                            ${isActive ? 'text-white' : 'text-zinc-500 hover:text-white/60'}
                                        `}
                                    >
                                        <tab.icon size={16} className={`mb-1 transition-transform duration-500 ${isActive ? 'scale-110' : 'scale-100'}`} />
                                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-all ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                                            {tab.label}
                                        </span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeMajorTab"
                                                className="absolute inset-0 bg-white/10 border border-white/10 -z-10"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        )}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeMajorTabGlow"
                                                className="absolute inset-0 bg-primary/5 blur-xl -z-20"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Fixed Header Container - Subfilters */}
                {currentUser && (
                    <div className="relative z-30 pointer-events-none mb-2">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="pointer-events-auto"
                        >
                            <div className="pb-0">
                                <ChatHeader
                                    activeHeading={activeHeading}
                                    setActiveHeading={setActiveHeading}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* City Switcher Banner (Visible only in World Tab) */}
                {activeTab === 'WORLD' && (
                    <div className="px-4 mb-4">
                        <motion.div
                            whileTap={{ scale: 0.98 }}
                            onClick={handleJoinCity}
                            className="w-full p-4 rounded-2xl bg-gradient-to-r from-electric-teal/10 to-transparent border border-electric-teal/20 flex items-center justify-between group cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-electric-teal/20 flex items-center justify-center text-electric-teal">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Current City</h3>
                                    <p className="text-[10px] font-medium text-electric-teal">Davao City <span className="text-white/30 ml-1">(Tap to switch)</span></p>
                                </div>
                            </div>
                            <ChevronLeft size={16} className="text-white/30 rotate-180 group-hover:text-white transition-colors" />
                        </motion.div>
                    </div>
                )}


                {/* Chat List */}
                <div className="px-4 space-y-2 pb-32">
                    <HeartbeatTransition loading={loading} label="Loading Chats...">
                        {chats.length === 0 ? (
                            <div className="py-20 text-center px-6">
                                {!currentUser ? (
                                    <>
                                        {/* Mobile Guest View: High-Impact Teaser */}
                                        <div className="md:hidden flex flex-col items-center justify-center py-10 px-4 text-center">
                                            {/* Icon Box */}
                                            <motion.div
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="w-24 h-24 rounded-[2.5rem] bg-white/[0.03] border border-white/10 flex items-center justify-center mb-8 relative group"
                                            >
                                                <div className="absolute inset-0 bg-electric-teal/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <MessageCircle size={32} className="text-electric-teal relative z-10" />
                                            </motion.div>

                                            {/* Title */}
                                            <motion.h2
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.1 }}
                                                className="text-2xl font-black tracking-tighter mb-4"
                                            >
                                                ENTER THE <span className="text-electric-teal">CHAT</span>
                                            </motion.h2>

                                            {/* Description */}
                                            <motion.p
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="text-[10px] font-bold text-white/40 leading-relaxed uppercase tracking-[0.2em] max-w-[280px] mb-12"
                                            >
                                                Coordinate quests and connect with those who share your intent. Join squads or go global... let's all be friends!
                                            </motion.p>

                                            {/* Features Grid */}
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                                className="grid grid-cols-3 gap-3 w-full mb-12"
                                            >
                                                {[
                                                    { icon: Zap, title: 'REAL-TIME', sub: 'CONNECT INSTANTLY' },
                                                    { icon: Users, title: 'SQUADS', sub: 'SHARE THE ADVENTURE' },
                                                    { icon: Lock, title: 'PRIVATE', sub: 'SAFE AND SECURE' }
                                                ].map((feat, i) => (
                                                    <div key={i} className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                                        <feat.icon size={14} className="text-electric-teal/50 mb-3" />
                                                        <h3 className="text-[8px] font-black text-white tracking-widest mb-1">{feat.title}</h3>
                                                        <p className="text-[6px] font-bold text-white/20 tracking-tighter whitespace-nowrap">{feat.sub}</p>
                                                    </div>
                                                ))}
                                            </motion.div>

                                            {/* Main CTA */}
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => window.dispatchEvent(new CustomEvent('trigger-auth-modal'))}
                                                className="px-8 py-4 bg-white text-black rounded-full flex items-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)] group transition-all"
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Join the Chat</span>
                                                <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                                            </motion.button>
                                        </div>

                                        {/* Desktop Sidebar Guest View: Layout Mocks */}
                                        <div className="hidden md:block space-y-4">
                                            <div className="mb-6">
                                                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 text-center">Global Groups</h3>
                                                <div className="space-y-3 opacity-60">
                                                    {[
                                                        { name: 'Davao Quest Central', users: '428', type: 'Public Lobby' },
                                                        { name: 'Manila Lore Feed', users: '1.2k', type: 'Lore Sync' },
                                                        { name: 'Cebu Sports Hub', users: '156', type: 'Public Lobby' }
                                                    ].map((mock, idx) => (
                                                        <div key={idx} className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3 filter blur-[1px] hover:blur-none transition-all cursor-not-allowed">
                                                            <div className="w-10 h-10 rounded-xl bg-white/10" />
                                                            <div className="flex-1">
                                                                <div className="h-3 w-24 bg-white/10 rounded mb-1" />
                                                                <div className="h-2 w-16 bg-white/5 rounded" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="opacity-20">
                                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">No chats found</p>
                                    </div>
                                )}
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
                                                <span className="text-gradient-static">
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
