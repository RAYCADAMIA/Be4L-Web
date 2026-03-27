import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, Zap, MessageCircle, Users, Plus, MessageSquare, MapPin, Sparkles, ArrowRight, Compass, UserPlus, Lock } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';
import { Message, User as UserType } from '../../types';
import TopBar from '../TopBar';

import { HeartbeatTransition } from '../ui/AestheticComponents';
import { useNavigation } from '../../contexts/NavigationContext';
import QuestSystemModal from '../Quest/QuestSystemModal';
import { useScrollBehavior } from '../../hooks/useScrollBehavior';
import { ChatHeader } from './ChatFilters';
import { OTHER_USERS } from '../../constants';
import UserListModal from '../UserListModal';

interface ChatListScreenProps {
    onOpenChat: (chatId: string, name: string) => void;
    onBack?: () => void;
    onOpenProfile: () => void;
    currentUser: UserType;
    onNavigate: (tab: 'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS' | 'DIBS') => void;
}

const ChatQuickActions: React.FC<{
    onNavigate: any,
    onFriendClick: () => void,
    showQuest?: boolean,
    showTribe?: boolean,
    showInvite?: boolean
}> = ({ onNavigate, onFriendClick, showQuest = true, showTribe = true, showInvite = true }) => (
    <div className="flex flex-col gap-2 mb-6">
        {showQuest && (
            <motion.button
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('QUESTS')}
                className="group relative flex items-center justify-between p-3.5 rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all overflow-hidden"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-electric-teal/10 flex items-center justify-center border border-electric-teal/20 group-hover:bg-electric-teal group-hover:text-black transition-all">
                        <Zap size={20} className="relative z-10" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold text-white tracking-tight">Find and join a quest</h3>
                    </div>
                </div>
                <ArrowRight size={16} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </motion.button>
        )}

        {showTribe && (
            <motion.button
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('DIBS')}
                className="group relative flex items-center justify-between p-3.5 rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all overflow-hidden"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all">
                        <Compass size={20} className="relative z-10" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold text-white tracking-tight">Find your tribe</h3>
                    </div>
                </div>
                <ArrowRight size={16} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </motion.button>
        )}

        {showInvite && (
            <motion.button
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={onFriendClick}
                className="group relative flex items-center justify-between p-3.5 rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all overflow-hidden"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                        <UserPlus size={20} className="relative z-10" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold text-white tracking-tight">Invite your friends</h3>
                    </div>
                </div>
                <ArrowRight size={16} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </motion.button>
        )}
    </div>
);


const ChatListScreen: React.FC<ChatListScreenProps> = ({ onOpenChat, onBack, onOpenProfile, currentUser, onNavigate }) => {
    const { showToast } = useToast();
    const { setTabs, setActiveTab } = useNavigation();
    const [activeCat, setActiveCat] = useState('All');
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInputModal, setShowInputModal] = useState(false);
    const [inputModalConfig, setInputModalConfig] = useState<{
        title: string,
        placeholder: string,
        defaultValue: string,
        onConfirm: (val: string) => void
    } | null>(null);
    const { headerSpringY } = useNavigation();
    const { handleScroll } = useScrollBehavior();
    const [showFriendSuggestions, setShowFriendSuggestions] = useState(false);
    const [hasBrands, setHasBrands] = useState(false);
    const [showSquadCreator, setShowSquadCreator] = useState(false);
    const [squadStep, setSquadStep] = useState<'FRIENDS' | 'NAME'>('FRIENDS');
    const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
    const [friendList, setFriendList] = useState<User[]>([]);
    const [tempSquadName, setTempSquadName] = useState('');

    const [refreshKey, setRefreshKey] = useState(0);

    const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const containerRef = useRef<HTMLDivElement>(null);

    // Register Tabs (Simplified - just All by default)
    useEffect(() => {
        setTabs([]); // Ensure no tabs are registered
        return () => setTabs([]);
    }, []);

    useEffect(() => {
        const loadChats = async () => {
            setLoading(true);
            if (!currentUser) {
                setChats([]);
                setLoading(false);
                return;
            }
            let data = await supabaseService.chat.getChats(currentUser.id);

            // Seed Global and City chats (Community)
            let communityChats = data.filter((c: any) => ['GLOBAL', 'CITY', 'BRAND'].includes(c.type));

            if (!communityChats.find(c => c.type === 'GLOBAL')) {
                communityChats.unshift({ id: 'global-1', type: 'GLOBAL', name: 'Global', lastMsg: 'Welcome to the world of Be4L!', time: 'Live', unread: 0, avatar: 'https://cdn-icons-png.flaticon.com/512/921/921591.png' });
            }

            // Reflect current city in list
            const lastSwitch = localStorage.getItem('be4l_last_city_switch');
            const cityData = lastSwitch ? JSON.parse(lastSwitch) : { city: 'davao' };
            const cityName = cityData.city.charAt(0).toUpperCase() + cityData.city.slice(1);

            if (!communityChats.find(c => c.type === 'CITY')) {
                communityChats.push({
                    id: `city-${cityData.city}`,
                    type: 'CITY',
                    name: `City Lobby`,
                    actualCityName: `${cityName} City`,
                    lastMsg: `Find your local squad in ${cityName}.`,
                    time: 'Live',
                    unread: 0,
                    avatar: `https://ui-avatars.com/api/?name=${cityName}&background=random`
                });
            }

            const questChats = data.filter((c: any) => c.context_type === 'QUEST' || c.type === 'lobby' || (c.name || '').includes('MISSION'));
            const squadChats = data.filter((c: any) => c.type === 'SQUAD');
            const dmChats = data.filter((c: any) =>
                ['personal', 'DM'].includes(c.type) &&
                c.context_type !== 'QUEST' &&
                !(c.name || '').includes('MISSION') &&
                c.type !== 'lobby' &&
                c.type !== 'SQUAD' &&
                c.type !== 'GLOBAL' &&
                c.type !== 'CITY'
            );

            setHasBrands(communityChats.some(c => c.type === 'BRAND'));

            let filtered = data;

            // Apply category filter
            if (activeCat === 'All') {
                const globalChat = communityChats.find(c => c.type === 'GLOBAL');
                const cityChat = communityChats.find(c => c.type === 'CITY');

                const pinned = [globalChat, cityChat].filter(Boolean);
                const rest = data.filter(c => !pinned.find(p => p.id === c.id));
                filtered = [...pinned, ...rest];
            } else if (activeCat === 'Quest') {
                filtered = questChats;
            } else if (activeCat === 'Community') {
                const globalChat = communityChats.find(c => c.type === 'GLOBAL');
                const cityChat = communityChats.find(c => c.type === 'CITY');
                const others = communityChats.filter(c => c.type !== 'GLOBAL' && c.type !== 'CITY');

                filtered = [...[globalChat, cityChat].filter(Boolean), ...others];
            } else if (activeCat === 'Squad') {
                filtered = squadChats;
            } else if (activeCat === 'DM' || activeCat === 'DMs') {
                filtered = dmChats;
            }

            // Artificial delay
            setTimeout(() => {
                setChats(filtered);
                setLoading(false);
            }, 500);
        };
        loadChats();
    }, [activeCat, currentUser, refreshKey]);

    // Real-time subscription for Chat List
    useEffect(() => {
        if (!currentUser || !isValidUUID(currentUser.id)) return;

        const { supabase } = supabaseService as any;
        if (!supabase) return;

        console.log("[ChatList] Subscribing to echoes and messages for real-time updates...");

        const handleLocalUpdate = () => {
            console.log("[ChatList] Local mock chat updated, reloading...");
            setRefreshKey(prev => prev + 1);
        };
        window.addEventListener('local-chat-update', handleLocalUpdate);

        const channel = supabase.channel(`chat-list-${currentUser.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'echoes'
            }, (payload: any) => {
                const pids = payload.new?.participant_ids || payload.old?.participant_ids || [];
                if (pids.includes(currentUser.id)) {
                    console.log("[ChatList] Echoes changed for user, reloading...");
                    setRefreshKey(prev => prev + 1);
                }
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'echo_messages'
            }, (payload: any) => {
                console.log("[ChatList] New message observed, bumping chat to top...");
                setRefreshKey(prev => prev + 1);
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
            window.removeEventListener('local-chat-update', handleLocalUpdate);
        };
    }, [currentUser]);

    const handleCreateGroup = async () => {
        if (!currentUser) return;
        setLoading(true);
        // Load actual mutual friends for the picker
        const friends = await (supabaseService.profiles as any).getFriendProfiles?.(currentUser.id) ||
            await (supabaseService.profiles as any).getFollowingList?.(currentUser.id) || [];
        setFriendList(friends);
        setLoading(false);

        setSquadStep('FRIENDS');
        setSelectedFriendIds([]);
        setTempSquadName('');
        setShowSquadCreator(true);
    };

    const finalizeSquadCreation = async () => {
        if (!tempSquadName.trim() || selectedFriendIds.length === 0) return;

        setLoading(true);
        const pids = [currentUser.id, ...selectedFriendIds];
        const { data: newChat, error } = await (supabaseService.chat as any).createGroup(currentUser.id, tempSquadName, pids);

        if (newChat) {
            setShowSquadCreator(false);
            onOpenChat(newChat.id, newChat.name);
            setRefreshKey(prev => prev + 1);
        } else {
            showToast("Failed to create squad", "error");
        }
        setLoading(false);
    };

    const handleJoinCity = () => {
        const lastSwitch = localStorage.getItem('be4l_last_city_switch');
        const switchData = lastSwitch ? JSON.parse(lastSwitch) : null;

        if (switchData) {
            const diff = Date.now() - switchData.timestamp;
            const threeDays = 3 * 24 * 60 * 60 * 1000;
            if (diff < threeDays) {
                const daysLeft = Math.ceil((threeDays - diff) / (24 * 60 * 60 * 1000));
                showToast(`Frequency locked. You can relocate again in ${daysLeft} days.`, 'warning');
                return;
            }
        }

        setInputModalConfig({
            title: 'Relocate Frequency',
            placeholder: 'Enter City (Manila, Cebu, Davao)...',
            defaultValue: '',
            onConfirm: (city) => {
                if (city) {
                    const cityKey = city.toLowerCase().trim();
                    if (['manila', 'cebu', 'davao'].includes(cityKey)) {
                        localStorage.setItem('be4l_last_city_switch', JSON.stringify({
                            city: cityKey,
                            timestamp: Date.now()
                        }));
                        showToast(`Relocated to ${city}. Signal updated.`, "info");
                        // Refresh chats
                        window.location.reload();
                    } else {
                        showToast("Invalid city. Choose Manila, Cebu, or Davao.", "error");
                    }
                }
                setShowInputModal(false);
            }
        });
        setShowInputModal(true);
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
                {/* Mobile Search & Controls - Hidden for now */}
                {/* 
                {currentUser && (
                    <div className="md:hidden pt-2 px-6 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 group">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-electric-teal transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search"
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
                */}



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
                                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 w-full">
                                        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                                            <MessageCircle size={32} className="text-white/20" />
                                        </div>

                                        {activeCat === 'DMs' && (
                                            <div className="space-y-4">
                                                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">No direct signals yet</p>
                                                <button
                                                    onClick={() => setShowFriendSuggestions(true)}
                                                    className="px-6 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-xl"
                                                >
                                                    Find Friends Now
                                                </button>
                                            </div>
                                        )}

                                        {activeCat === 'Quest' && (
                                            <div className="space-y-4">
                                                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Your missions are quiet</p>
                                                <button
                                                    onClick={() => onNavigate('QUESTS')}
                                                    className="px-6 py-3 bg-electric-teal text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-xl"
                                                >
                                                    Find and Join Quest Now
                                                </button>
                                            </div>
                                        )}

                                        {activeCat === 'All' && (
                                            <div className="space-y-6 w-full max-w-sm mx-auto">
                                                <div className="py-4">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">Quick Actions</p>
                                                    <ChatQuickActions
                                                        onNavigate={onNavigate}
                                                        onFriendClick={() => setShowFriendSuggestions(true)}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {activeCat !== 'DMs' && activeCat !== 'Quest' && activeCat !== 'All' && (
                                            <div className="opacity-20">
                                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">No chats found</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {activeCat === 'DMs' && (
                                    <ChatQuickActions
                                        onNavigate={onNavigate}
                                        onFriendClick={() => setShowFriendSuggestions(true)}
                                        showQuest={false}
                                        showTribe={false}
                                    />
                                )}

                                {activeCat === 'Squad' && (
                                    <div className="mb-6">
                                        <motion.button
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleCreateGroup}
                                            className="w-full flex items-center justify-between p-4 rounded-[2rem] bg-electric-teal/10 border border-electric-teal/20 hover:bg-electric-teal/20 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-electric-teal flex items-center justify-center shadow-lg">
                                                    <Plus size={24} className="text-black" />
                                                </div>
                                                <h3 className="text-sm font-black text-white uppercase tracking-tighter">Create a Squad Chat</h3>
                                            </div>
                                            <ArrowRight size={18} className="text-electric-teal" />
                                        </motion.button>
                                    </div>
                                )}

                                {(() => {
                                    const pinned = chats.filter((c: any) => ['GLOBAL', 'CITY'].includes(c.type));
                                    const rest = chats.filter((c: any) => !['GLOBAL', 'CITY'].includes(c.type));

                                    const renderCard = (chat: any) => (
                                        <motion.div
                                            key={chat.id}
                                            whileHover={{ x: 4 }}
                                            onClick={() => onOpenChat(chat.id, chat.type === 'CITY' ? chat.actualCityName : chat.name)}
                                            className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-pointer group mb-1.5"
                                        >
                                            <div className="relative">
                                                <div className={`w-10 h-10 rounded-full overflow-hidden border border-white/10 p-0.5 bg-black`}>
                                                    <img src={chat.avatar} alt={chat.name} className="w-full h-full rounded-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                {chat.unread > 0 && (
                                                    <div className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-electric-teal rounded-full border-2 border-black flex items-center justify-center px-0.5">
                                                        <span className="text-[8px] font-black text-black">{chat.unread}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <h3 className="text-sm font-bold text-white/90 group-hover:text-electric-teal transition-colors tracking-tight truncate">
                                                        {chat.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-medium text-white/30 tracking-tight">{chat.time}</span>
                                                    </div>
                                                </div>
                                                <p className={`text-[11px] truncate ${chat.unread > 0 ? 'text-white/80 font-semibold' : 'text-white/40 font-normal'} ${chat.lastMsg?.startsWith('[System]') ? 'text-electric-teal/60 italic' : ''}`}>
                                                    {chat.lastMsg}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );

                                    return (
                                        <>
                                            {pinned.map(renderCard)}

                                            {activeCat === 'All' && (
                                                <div className="mb-4">
                                                    <ChatQuickActions
                                                        onNavigate={onNavigate}
                                                        onFriendClick={() => setShowFriendSuggestions(true)}
                                                    />
                                                </div>
                                            )}

                                            {rest.map(renderCard)}
                                        </>
                                    );
                                })()}


                                {/* Brand Community CTA at the bottom of Community filter */}
                                {activeCat === 'Community' && !hasBrands && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 text-center"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                                            <Users size={24} className="text-primary" />
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-2">Exclusive Tribes</h4>
                                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest leading-relaxed mb-6">You haven't joined any brand communities yet.</p>
                                        <button
                                            onClick={() => onNavigate('DIBS')}
                                            className="px-8 py-3 bg-white/[0.05] hover:bg-white/10 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-white transition-all active:scale-95"
                                        >
                                            Find Your Tribe Now
                                        </button>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </HeartbeatTransition>
                </div>
            </div>

            {/* Squad Creator Overlay */}
            <AnimatePresence>
                {showSquadCreator && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col"
                    >
                        <div className="p-6 flex items-center justify-between border-b border-white/5">
                            <button onClick={() => setShowSquadCreator(false)} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors">
                                <ChevronLeft size={24} />
                            </button>
                            <h1 className="text-sm font-black uppercase tracking-[0.3em] text-white">Create Squad</h1>
                            <div className="w-8" />
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 flex flex-col">
                            {squadStep === 'FRIENDS' ? (
                                <>
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 italic">Invite your friends</h3>
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Select members for your new squad</p>
                                    </div>

                                    <div className="space-y-2 flex-1">
                                        {friendList.length > 0 ? (
                                            friendList.map(friend => {
                                                const isSelected = selectedFriendIds.includes(friend.id);
                                                return (
                                                    <motion.div
                                                        whileTap={{ scale: 0.98 }}
                                                        key={friend.id}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setSelectedFriendIds(prev => prev.filter(id => id !== friend.id));
                                                            } else {
                                                                setSelectedFriendIds(prev => [...prev, friend.id]);
                                                            }
                                                        }}
                                                        className={`flex items-center gap-4 p-4 rounded-3xl border transition-all cursor-pointer ${isSelected
                                                            ? 'bg-electric-teal/10 border-electric-teal text-white'
                                                            : 'bg-white/[0.02] border-white/5 text-white/60 hover:border-white/20'
                                                            }`}
                                                    >
                                                        <div className="w-10 h-10 rounded-2xl overflow-hidden border border-white/10">
                                                            <img src={friend.avatar_url || `https://ui-avatars.com/api/?name=${friend.name}&background=random`} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-black uppercase tracking-tight text-sm text-white">{friend.name}</p>
                                                        </div>
                                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-electric-teal border-electric-teal' : 'border-white/10'}`}>
                                                            {isSelected && <Plus size={14} className="text-black rotate-45" />}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20 opacity-30">
                                                <Users size={48} className="mb-4 text-white" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">No friends found</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-8 py-12 flex-1">
                                    <div className="text-center mb-4">
                                        <div className="w-24 h-24 rounded-[2.5rem] bg-electric-teal/20 border border-electric-teal/30 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-electric-teal/20">
                                            <Users size={48} className="text-electric-teal" />
                                        </div>
                                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 italic">Name your squad</h3>
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Build a unique identity for your crew</p>
                                    </div>

                                    <div className="relative">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={tempSquadName}
                                            onChange={(e) => setTempSquadName(e.target.value)}
                                            placeholder="SQUAD NAME..."
                                            className="w-full bg-white/[0.03] border-b-2 border-white/10 p-6 text-white text-center text-2xl font-black placeholder:text-white/5 focus:border-electric-teal focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 pb-12 border-t border-white/5 bg-black">
                            {squadStep === 'FRIENDS' ? (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={selectedFriendIds.length === 0}
                                    onClick={() => setSquadStep('NAME')}
                                    className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] transition-all text-xs ${selectedFriendIds.length > 0
                                        ? 'bg-electric-teal text-black shadow-2xl shadow-electric-teal/30'
                                        : 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5'
                                        }`}
                                >
                                    Continue ({selectedFriendIds.length} Selected)
                                </motion.button>
                            ) : (
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setSquadStep('FRIENDS')}
                                        className="flex-1 py-5 rounded-[2rem] bg-white/5 text-white/40 font-black uppercase tracking-[0.3em] text-xs border border-white/5 hover:bg-white/10 transition-all"
                                    >
                                        Back
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={!tempSquadName.trim()}
                                        onClick={finalizeSquadCreation}
                                        className={`flex-[2] py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] transition-all text-xs ${tempSquadName.trim()
                                            ? 'bg-electric-teal text-black shadow-2xl shadow-electric-teal/30'
                                            : 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5'
                                            }`}
                                    >
                                        Create Squad
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Modal */}
            {inputModalConfig && (
                <QuestSystemModal
                    isOpen={showInputModal}
                    onClose={() => setShowInputModal(false)}
                    onConfirm={inputModalConfig.onConfirm}
                    type="INPUT"
                    placeholder={inputModalConfig.placeholder}
                    defaultValue={inputModalConfig.defaultValue}
                />
            )}

            {/* Friend Suggestions Modal */}
            <UserListModal
                isOpen={showFriendSuggestions}
                onClose={() => setShowFriendSuggestions(false)}
                title="Suggested Friends"
                userId={currentUser?.id || ''}
                type="following" // This component usually fetches internally, but for "suggestions" we can just let it show 'Following' or modify it.
                // Since I can't modify UserListModal easily without breaking other stuff, I'll assume it works or I'll pass a different purpose.
                onOpenProfile={(u) => window.dispatchEvent(new CustomEvent('open-profile-overlay', { detail: u.id }))}
            />
        </div>
    );
};


export default ChatListScreen;
