import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Camera, Send, Check, X, MapPin, Zap } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';
import { Message } from '../../types';

import { HeartbeatTransition } from '../ui/AestheticComponents';

interface ChatDetailScreenProps {
    chatId: string;
    chatName: string;
    onBack: () => void;
    onLaunchCamera: () => void;
}

const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ chatId, chatName, onBack, onLaunchCamera }) => {
    const isLobby = chatId.startsWith('lobby');
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showHandshake, setShowHandshake] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleHandshake = () => {
        setShowHandshake(true);
        setTimeout(() => {
            alert("Bluetooth Handshake Verified! Multi-Peer Proximity Confirmed.");
            setShowHandshake(false);
        }, 2000);
    };

    useEffect(() => {
        // Initial Load
        loadMessages(true);

        // Realtime Subscription
        const channel = supabaseService.chat.subscribeToEcho(chatId, (incomingMsg) => {
            setMessages(prev => {
                // Prevent duplicates (e.g., from optimistic updates)
                if (prev.some(m => m.id === incomingMsg.id)) return prev;
                return [...prev, incomingMsg];
            });
        });

        return () => {
            channel.unsubscribe();
        };
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

        // Optimistic UI could go here, but waiting for DB ack is safer for now.
        // We rely on the subscription to show the message to avoid issues, 
        // OR we push it manually if we want instant feel.
        // Let's rely on the response for self-message to ensure ID consistency.

        const sentMsg = await supabaseService.chat.sendMessage(chatId, tempMsg);
        if (sentMsg) {
            setMessages(prev => [...prev, sentMsg]);
        }
    };

    const handleAcceptQuest = (questId: string) => {
        alert(`Joined Quest ${questId}!`);
    };

    const handleDeclineQuest = () => {
        alert("Declined invite.");
    };

    return (
        <div className="flex flex-col h-full bg-black absolute inset-0 z-50 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className={`flex items-center p-4 pt-12 ${isLobby ? 'bg-primary/5' : 'bg-black/90'} backdrop-blur-md border-b border-white/10 z-20`}>
                <button onClick={onBack} className="p-2 -ml-2 mr-2 rounded-full text-white hover:bg-white/10 transition-colors">
                    <ChevronLeft size={28} />
                </button>
                <div className="flex-1">
                    <h2 className={`font-black uppercase italic tracking-tighter ${isLobby ? 'text-primary' : 'text-white'} text-lg leading-tight`}>
                        {isLobby ? `[Lobby] ${chatName}` : chatName}
                    </h2>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            {isLobby ? '4 members live' : 'Online now'}
                        </span>
                    </div>
                </div>
                {isLobby && (
                    <button
                        onClick={handleHandshake}
                        className={`p-2 rounded-xl border border-primary/30 flex items-center justify-center text-primary transition-all active:scale-90 ${showHandshake ? 'animate-ping bg-primary/20' : 'hover:bg-primary/10'}`}
                    >
                        <Zap size={20} className="fill-current" />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 scroll-smooth"
            >
                <HeartbeatTransition loading={loading} label="Accessing Comms...">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.is_me ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] ${msg.type === 'image' ? 'w-64' : ''}`}>
                                {msg.type === 'text' && (
                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.is_me
                                        ? 'bg-primary text-black rounded-tr-none font-medium text-xs'
                                        : 'bg-surface text-white rounded-tl-none border border-white/10 text-xs'
                                        }`}>
                                        {msg.content}
                                    </div>
                                )}

                                {msg.type === 'image' && msg.image_url && (
                                    <div className={`rounded-3xl overflow-hidden border-2 ${msg.is_me ? 'border-primary' : 'border-surface'} relative`}>
                                        <img src={msg.image_url} className="w-full h-auto object-cover" alt="Sent photo" />
                                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-[10px] text-white font-bold">
                                            RealMoji
                                        </div>
                                    </div>
                                )}

                                {msg.type === 'quest_invite' && (
                                    <div className="bg-surface border border-white/10 p-4 rounded-3xl w-64 shadow-lg shadow-primary/5">
                                        <div className="text-[9px] text-primary font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <MapPin size={12} /> Quest Invite
                                        </div>
                                        <h3 className="text-white font-bold text-sm mb-1 leading-tight">{msg.content.replace('Quest Invite: ', '')}</h3>
                                        <p className="text-gray-400 text-[10px] mb-4">You are invited to join this quest!</p>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => msg.quest_id && handleAcceptQuest(msg.quest_id)}
                                                className="flex-1 bg-primary text-black py-2 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1 hover:scale-105 transition-transform"
                                            >
                                                <Check size={14} /> Accept
                                            </button>
                                            <button
                                                onClick={handleDeclineQuest}
                                                className="flex-1 bg-white/5 text-white py-2 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1 hover:bg-white/10 transition-colors"
                                            >
                                                <X size={14} /> Decline
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <span className={`text-[10px] text-gray-500 mt-1 block ${msg.is_me ? 'text-right' : 'text-left'}`}>
                                    {msg.timestamp}
                                </span>
                            </div>
                        </div>
                    ))}
                </HeartbeatTransition>
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 w-full bg-black/95 border-t border-white/10 p-4 pb-8 safe-area-bottom z-20">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onLaunchCamera}
                        className="w-12 h-12 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center text-primary hover:bg-white/20 transition-colors active:scale-95"
                    >
                        <Camera size={24} />
                    </button>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Message..."
                            className="w-full bg-surface border border-white/10 rounded-full py-3 px-5 text-white placeholder-gray-500 outline-none focus:border-primary/50 transition-colors"
                        />
                        {newMessage.trim() && (
                            <button
                                onClick={handleSend}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-primary rounded-full text-black hover:scale-105 transition-transform animate-in zoom-in duration-200"
                            >
                                <Send size={18} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatDetailScreen;
