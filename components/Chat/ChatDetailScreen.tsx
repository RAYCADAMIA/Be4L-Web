import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Camera, Send, Check, X, MapPin } from 'lucide-react';
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
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadMessages(true); // first load
        // Poll for new messages (simulate real-time)
        const interval = setInterval(() => loadMessages(false), 3000); // 3s polling
        return () => clearInterval(interval);
    }, [chatId]);

    const loadMessages = async (isFirst: boolean) => {
        if (isFirst) setLoading(true);
        const data = await supabaseService.chat.getMessages(chatId);
        // Only update if difference (simple check)
        setMessages(prev => {
            if (prev.length !== data.length) return data;
            return prev;
        });
        if (isFirst) setLoading(false);
    };

    useEffect(() => {
        // Scroll to bottom on load/new message
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        const tempMsg = newMessage;
        setNewMessage('');

        await supabaseService.chat.sendMessage(chatId, tempMsg);
        loadMessages(false);
    };

    const handleAcceptQuest = (questId: string) => {
        alert(`Joined Quest ${questId}!`);
        // In real app, call supabaseService.quests.joinQuest(...)
    };

    const handleDeclineQuest = () => {
        alert("Declined invite.");
    };

    return (
        <div className="flex flex-col h-full bg-black absolute inset-0 z-50 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center p-4 pt-12 bg-black/90 backdrop-blur-md border-b border-white/10 z-20">
                <button onClick={onBack} className="p-2 -ml-2 mr-2 rounded-full text-white hover:bg-white/10 transition-colors">
                    <ChevronLeft size={28} />
                </button>
                <div className="flex-1">
                    <h2 className="font-bold text-base text-white leading-tight">{chatName}</h2>
                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online now</span>
                </div>
                <div className="w-10" /> {/* Spacer */}
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
