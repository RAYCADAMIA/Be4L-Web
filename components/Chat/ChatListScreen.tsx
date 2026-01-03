import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';
import { Message, User as UserType } from '../../types';
import TopBar from '../TopBar';

import { HeartbeatTransition } from '../ui/AestheticComponents';

interface ChatListScreenProps {
    onOpenChat: (chatId: string, name: string) => void;
    onBack?: () => void;
    onOpenProfile: () => void;
    currentUser: UserType;
    onNavigate: (tab: 'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS') => void;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({ onOpenChat, onBack, onOpenProfile, currentUser, onNavigate }) => {
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Scroll Logic
    const [showTopBar, setShowTopBar] = useState(true);
    const lastScrollY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastClickTimeRef = useRef(0);

    const handleLogoClick = () => {
        const now = Date.now();
        if (now - lastClickTimeRef.current < 300) {
            // Double Click -> Go Home
            onNavigate('HOME');
        } else {
            // Single Click -> Scroll to Top
            containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
        lastClickTimeRef.current = now;
    };

    const handleScroll = () => {
        const currentScrollY = containerRef.current?.scrollTop || 0;
        if (currentScrollY < 10) {
            setShowTopBar(true);
        } else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            setShowTopBar(false);
        } else if (currentScrollY < lastScrollY.current) {
            setShowTopBar(true);
        }
        lastScrollY.current = currentScrollY;
    };

    useEffect(() => {
        const loadChats = async () => {
            setLoading(true);
            const data = await supabaseService.chat.getChats();
            setChats(data);
            setLoading(false);
        };
        loadChats();
    }, []);

    return (
        <div className="flex-1 h-full relative flex flex-col overflow-hidden">
            <TopBar
                visible={showTopBar}
                onOpenProfile={onOpenProfile}
                user={currentUser}
                onLogoClick={handleLogoClick}
                onSearchClick={() => onNavigate('SEARCH')}
                onNotificationsClick={() => onNavigate('NOTIFICATIONS')}
            />

            {/* List */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto pt-24 pb-24 space-y-2 px-4 no-scrollbar"
            >
                <HeartbeatTransition loading={loading} label="Finding Convos...">
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => onOpenChat(chat.id, chat.name)}
                            className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-white/5 active:bg-surface transition-colors cursor-pointer group"
                        >
                            <div className="relative">
                                <img src={chat.avatar} alt={chat.name} className="w-14 h-14 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-all" />
                                {chat.unread > 0 && <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold text-black">{chat.unread}</div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-bold text-white truncate pr-2 text-base">{chat.name}</h3>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">{chat.time}</span>
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
