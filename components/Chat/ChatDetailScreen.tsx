import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Camera, Send, Check, X, MapPin, Zap, Info, Phone, Shield, Trash2, Sparkles, ChevronRight } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';
import { Message } from '../../types';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_USER, OTHER_USERS } from '../../constants';

import { HeartbeatTransition } from '../ui/AestheticComponents';

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
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Resolve the other person's ID from messages if it's an Echo
    const targetUserId = messages.find(m => !m.is_me)?.sender_id || chatId;

    const handleCall = () => {
        triggerToast('feature coming soon...');
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
        return () => channel.unsubscribe();
    }, [chatId]);

    const loadMessages = async (isFirst: boolean) => {
        if (isFirst) setLoading(true);
        const data = await supabaseService.chat.getMessages(chatId);
        setMessages(data);
        if (isFirst) setLoading(false);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        const tempMsg = newMessage;
        setNewMessage('');
        const sentMsg = await supabaseService.chat.sendMessage(chatId, tempMsg);
        if (sentMsg) {
            setMessages(prev => [...prev, sentMsg]);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent relative">
            {/* Header Spacer - Minimal since Global Logo is now hidden in Detail mode */}
            <div className="h-[80px] w-full shrink-0" />

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
                        onClick={() => navigate(`/app/profile/${targetUserId}`)}
                        className="flex flex-col ml-1 group text-left active:scale-[0.98] transition-transform"
                    >
                        <h2 className="text-xl font-black tracking-tighter uppercase text-white flex items-center gap-2 leading-none group-hover:text-primary transition-colors">
                            <span className="animate-liquid-text">
                                {chatName}
                            </span>
                            {isLobby && <Zap size={14} className="text-primary fill-primary" />}
                        </h2>
                    </button>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <button onClick={handleCall} className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/30 transition-all shadow-lg active:scale-90">
                        <Phone size={18} />
                    </button>
                </div>
            </header>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 py-4 space-y-8 no-scrollbar scroll-smooth"
            >
                <HeartbeatTransition loading={loading} label="Decrypting Comms...">
                    {messages.length === 0 ? (
                        <div className="py-20 text-center opacity-10">
                            <Zap size={48} className="mx-auto mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest">Awaiting signal...</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const showAvatar = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id;
                            const senderId = msg.sender_id === 'me' ? 'me' : msg.sender_id;

                            return (
                                <div key={msg.id} className={`flex ${msg.is_me ? 'justify-end' : 'justify-start'} group items-end gap-3`}>
                                    {!msg.is_me && (
                                        <div
                                            onClick={() => navigate(`/app/profile/${senderId}`)}
                                            className={`w-9 h-9 rounded-[1.1rem] bg-white/5 border border-white/10 shrink-0 transition-all cursor-pointer hover:border-primary/50 overflow-hidden shadow-lg ${showAvatar ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                                        >
                                            <img
                                                src={[...OTHER_USERS, MOCK_USER].find(u => u.id === senderId)?.avatar_url || `https://i.pravatar.cc/100?u=${senderId}`}
                                                className="w-full h-full object-cover"
                                                alt="avatar"
                                            />
                                        </div>
                                    )}
                                    <div className={`flex flex-col ${msg.is_me ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                        <div className={`
                                            px-5 py-3.5 text-[13px] leading-relaxed shadow-2xl relative
                                            ${msg.is_me
                                                ? 'bg-gradient-to-br from-primary to-primary/80 text-black font-bold rounded-[1.8rem] rounded-br-[0.4rem]'
                                                : 'bg-white/[0.03] backdrop-blur-md text-white font-medium border border-white/5 rounded-[1.8rem] rounded-bl-[0.4rem]'}
                                        `}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[7px] font-black uppercase tracking-widest text-white/20 mt-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {msg.timestamp}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </HeartbeatTransition>
            </div>

            {/* Input Bar */}
            <div className="p-6 pb-10 md:pb-8 shrink-0 relative z-20">
                <div className="max-w-4xl mx-auto flex items-center gap-3 bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-2 rounded-[2.2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] focus-within:border-primary/30 transition-all duration-500">
                    <button
                        onClick={handleCamera}
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all outline-none"
                    >
                        <Camera size={20} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="What's up, chat?"
                        className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold text-white placeholder:text-white/10 px-2 uppercase tracking-wide"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className={`
                            w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500
                            ${newMessage.trim() ? 'bg-primary text-black scale-100 rotate-0 shadow-[0_0_20px_rgba(45,212,191,0.4)]' : 'bg-white/5 text-white/10 scale-90 rotate-12'}
                        `}
                    >
                        <Send size={18} className={newMessage.trim() ? 'translate-x-0.5' : ''} />
                    </button>
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
