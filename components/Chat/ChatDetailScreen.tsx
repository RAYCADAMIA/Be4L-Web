import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Camera, Send, Check, X, MapPin, Zap, Info } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';
import { Message } from '../../types';
import { useNavigate } from 'react-router-dom';

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
    const [showHandshake, setShowHandshake] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleHandshake = () => {
        setShowHandshake(true);
        setTimeout(() => {
            // Placeholder for proximity verification
            setShowHandshake(false);
        }, 2000);
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
            {/* Minimalist Glass Header */}
            <header className={`
                flex items-center justify-between p-4 md:px-8 md:py-6 sticky top-0 z-30
                backdrop-blur-xl border-b border-white/5
                ${isLobby ? 'bg-primary/5' : 'bg-black/60'}
            `}>
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="md:hidden p-2 -ml-2 rounded-full text-white/60 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-lg font-black italic tracking-tighter uppercase text-white flex items-center gap-2">
                            <span className="animate-liquid-text">
                                {chatName}
                            </span>
                            {isLobby && <Zap size={14} className="text-primary fill-primary" />}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Live Coordination</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <button onClick={handleHandshake} className={`w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/30 transition-all ${showHandshake ? 'animate-ping' : ''}`}>
                        <Zap size={18} />
                    </button>
                    <button onClick={onToggleInfo} className="w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
                        <Info size={18} />
                    </button>
                </div>
            </header>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar scroll-smooth"
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
                                            onClick={() => navigate(`?profile=${senderId}`)}
                                            className={`w-8 h-8 rounded-2xl bg-white/5 border border-white/10 shrink-0 transition-opacity cursor-pointer hover:border-primary/50 overflow-hidden ${showAvatar ? 'opacity-100' : 'opacity-0'}`}
                                        >
                                            <img src={`https://i.pravatar.cc/100?u=${senderId}`} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className={`flex flex-col ${msg.is_me ? 'items-end' : 'items-start'}`}>
                                        <div className={`
                                            px-5 py-3 text-sm leading-relaxed max-w-[280px] md:max-w-md shadow-2xl
                                            ${msg.is_me
                                                ? 'bg-primary text-black font-bold rounded-[1.8rem] rounded-br-[0.4rem]'
                                                : 'bg-white/[0.03] text-white font-medium border border-white/5 rounded-[1.8rem] rounded-bl-[0.4rem]'}
                                        `}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                <div className="max-w-4xl mx-auto flex items-center gap-3 bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-2 rounded-[2rem] shadow-3xl focus-within:border-primary/20 transition-all">
                    <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                        <Camera size={20} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Coordination code..."
                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-white placeholder:text-gray-700 px-2"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className={`
                            w-10 h-10 rounded-full flex items-center justify-center transition-all animate-in zoom-in duration-300
                            ${newMessage.trim() ? 'bg-primary text-black' : 'bg-white/5 text-gray-600'}
                        `}
                    >
                        <Send size={18} className={newMessage.trim() ? 'translate-x-0.5' : ''} />
                    </button>
                </div>
            </div>
        </div>
    );
};


export default ChatDetailScreen;
