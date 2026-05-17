import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, MapPin, Zap, MoreHorizontal, Globe } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';
import { Message } from '../../types';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_USER, OTHER_USERS } from '../../constants';

import { HeartbeatTransition } from '../ui/AestheticComponents';
import MessageBubble from './MessageBubble';
import ChatComposer from './ChatComposer';
import EmptyState from '../ui/EmptyState';

interface ChatDetailScreenProps {
    chatId: string;
    chatName: string;
    onBack: () => void;
    onLaunchCamera: () => void;
    onToggleInfo?: () => void;
}

const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ chatId, chatName, onBack, onLaunchCamera, onToggleInfo }) => {
    const navigate = useNavigate();
    const isLobby = chatId.startsWith('lobby');
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [chatType, setChatType] = useState<string>('personal');
    const [cooldown, setCooldown] = useState(0);
    const cooldownRef = useRef<NodeJS.Timeout | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Resolve the other person's ID from messages if it's an Echo
    const targetUserId = messages.find(m => !m.is_me)?.sender_id || chatId;

    const handleMoreOptions = () => {
        if (onToggleInfo) onToggleInfo();
    };

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const handleCamera = () => {
        triggerToast('feature coming soon...');
    };

    useEffect(() => {
        loadMessages(true);
        const channel = supabaseService.chat.subscribeToEcho(chatId, (incomingMsg) => {
            setMessages(prev => {
                if (prev.some(m => m.id === incomingMsg.id)) return prev;
                return [...prev, incomingMsg];
            });
        });
        return () => { channel.unsubscribe(); };
    }, [chatId]);

    const loadMessages = async (isFirst: boolean) => {
        if (isFirst) setLoading(true);
        // Fetch chat details to get type
        const chats = await supabaseService.chat.getChats();
        const currentChat = chats.find(c => c.id === chatId);
        if (currentChat) setChatType(currentChat.type);

        const data = await supabaseService.chat.getMessages(chatId);
        setMessages(data);
        if (isFirst) setLoading(false);
    };

    // Cooldown Timer
    useEffect(() => {
        if (cooldown > 0) {
            cooldownRef.current = setTimeout(() => setCooldown(c => c - 1), 1000);
        }
        return () => {
            if (cooldownRef.current) clearTimeout(cooldownRef.current);
        };
    }, [cooldown]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async () => {
        if (!newMessage.trim() || cooldown > 0) return;

        const tempMsg = newMessage;
        setNewMessage('');

        // Trigger Cooldown for Global/City
        if (['GLOBAL', 'CITY'].includes(chatType)) {
            setCooldown(10);
        }

        const isFirstMessage = messages.length === 0;

        const sentMsg = await supabaseService.chat.sendMessage(chatId, tempMsg);
        if (sentMsg) {
            setMessages(prev => [...prev, sentMsg]);

            // First time DM notification
            if (isFirstMessage && ['personal', 'DM'].includes(chatType)) {
                try {
                    // Only attempt for valid Supabase UUIDs
                    if (targetUserId && targetUserId !== 'me' && targetUserId.length > 20) {
                        const { supabase } = supabaseService as any;
                        const { data: { user: currentUser } } = await supabase.auth.getUser();

                        let senderName = 'Someone';
                        if (currentUser?.user_metadata?.name) {
                            senderName = currentUser.user_metadata.name;
                        } else if (currentUser) {
                            const result: any = await supabaseService.profiles.getProfile(currentUser.id);
                            const profile = result?.data ?? result;
                            if (profile?.name) senderName = profile.name;
                        }

                        await supabaseService.notifications.createNotification({
                            user_id: targetUserId,
                            type: 'MESSAGE',
                            title: 'New Message',
                            content: `${senderName} sent you a message`,
                            metadata: { link: `/app/chat?id=${chatId}` }
                        });
                    }
                } catch (e) {
                    console.error("Failed to send first message notification", e);
                }
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent relative">
            {/* Header Spacer - Reduced on mobile since Global Header is hidden */}
            <div className="h-4 md:h-[80px] w-full shrink-0" />

            {/* Minimalist Immersive Header */}
            <header className={`
                flex items-center justify-between p-4 md:px-8 md:py-6 relative z-30 transition-all duration-700
                ${isLobby ? 'bg-primary/5' : 'bg-transparent'}
            `}>
                <div className="flex items-center gap-2">
                    <button onClick={onBack} className="p-3 -ml-2 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all active:scale-90 shadow-lg">
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => navigate(`/app/${targetUserId}`)}
                        className="flex flex-col ml-1 group text-left active:scale-[0.98] transition-transform"
                    >
                        <h2 className="text-xl font-black tracking-tighter text-white flex items-center gap-2 leading-none group-hover:text-primary transition-colors">
                            <span className="text-gradient-static">
                                {chatName}
                            </span>
                            {isLobby && <Zap size={14} className="text-primary fill-primary" />}
                            {chatType === 'GLOBAL' && <Globe size={14} className="text-blue-400" />}
                            {chatType === 'CITY' && <MapPin size={14} className="text-emerald-400" />}
                        </h2>
                        {['GLOBAL', 'CITY'].includes(chatType) && (
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest pl-1">
                                {chatType === 'GLOBAL' ? 'Global Broadcast' : 'Live Frequency'}
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <button onClick={handleMoreOptions} className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/30 transition-all shadow-lg active:scale-90">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </header>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 md:px-6 py-4 no-scrollbar scroll-smooth"
            >
                <HeartbeatTransition loading={loading} label="Decrypting Comms...">
                    {messages.length === 0 ? (
                        <div className="py-16">
                            <EmptyState
                                icon={<Zap size={20} />}
                                title="Awaiting signal"
                                subtitle="Send the first message and kick off the chat."
                            />
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto">
                            {messages.map((msg, idx) => {
                                const prev = messages[idx - 1];
                                const next = messages[idx + 1];
                                const senderId = msg.sender_id === 'me' ? 'me' : msg.sender_id;
                                const avatar =
                                    [...OTHER_USERS, MOCK_USER].find((u) => u.id === senderId)?.avatar_url ||
                                    `https://i.pravatar.cc/100?u=${senderId}`;
                                return (
                                    <MessageBubble
                                        key={msg.id}
                                        message={msg}
                                        prev={prev}
                                        next={next}
                                        senderAvatar={avatar}
                                        showAvatar
                                    />
                                );
                            })}
                        </div>
                    )}
                </HeartbeatTransition>
            </div>

            {/* Composer */}
            <div className="shrink-0 relative z-20 pb-safe">
                <div className="max-w-4xl mx-auto">
                    <ChatComposer
                        value={newMessage}
                        onChange={setNewMessage}
                        onSend={handleSend}
                        onCamera={handleCamera}
                        cooldown={cooldown}
                        placeholder="What's up, chat?"
                    />
                </div>
            </div>
            {/* Minimalist Floating Toast */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className="fixed bottom-32 left-1/2 z-[100] px-6 py-3 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-full shadow-[0_0_30px_rgba(204,255,0,0.3)] pointer-events-none"
                    >
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default ChatDetailScreen;
