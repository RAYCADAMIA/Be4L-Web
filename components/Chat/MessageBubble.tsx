import React from 'react';
import { motion } from 'framer-motion';
import { Message } from '../../types';

interface MessageBubbleProps {
    message: Message;
    prev?: Message;
    next?: Message;
    senderAvatar?: string;
    showAvatar?: boolean;
}

const GROUP_WINDOW_MS = 5 * 60 * 1000;

const sameSender = (a: Message, b: Message) => a.sender_id === b.sender_id;

const closeInTime = (a: Message, b: Message) => {
    const ta = new Date(a.created_at || a.timestamp || 0).getTime();
    const tb = new Date(b.created_at || b.timestamp || 0).getTime();
    return Math.abs(ta - tb) <= GROUP_WINDOW_MS;
};

const formatTime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    prev,
    next,
    senderAvatar,
    showAvatar = true,
}) => {
    const isMe = !!message.is_me;

    const groupedWithPrev = prev && sameSender(prev, message) && closeInTime(prev, message);
    const groupedWithNext = next && sameSender(next, message) && closeInTime(message, next);

    const isFirstOfGroup = !groupedWithPrev;
    const isLastOfGroup = !groupedWithNext;

    // System & quest invite messages render differently
    if (message.content_type === 'system' || message.type === 'system') {
        return (
            <div className="flex justify-center py-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B7E6D] bg-white/[0.02] border border-white/5 rounded-full px-3 py-1">
                    {message.content}
                </span>
            </div>
        );
    }

    const baseBubble =
        'max-w-[75%] px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap';

    // Corner logic for iMessage-style grouping
    let cornerClass = '';
    if (isMe) {
        cornerClass = `rounded-2xl ${
            isLastOfGroup ? 'rounded-br-md' : 'rounded-br-2xl'
        } ${isFirstOfGroup ? 'rounded-tr-2xl' : 'rounded-tr-md'}`;
    } else {
        cornerClass = `rounded-2xl ${
            isLastOfGroup ? 'rounded-bl-md' : 'rounded-bl-2xl'
        } ${isFirstOfGroup ? 'rounded-tl-2xl' : 'rounded-tl-md'}`;
    }

    const colorClass = isMe
        ? 'bg-[#2DD4BF] text-black shadow-[0_4px_20px_rgba(45,212,191,0.2)]'
        : 'bg-white/[0.05] text-[#F5E6D3] border border-white/5';

    const marginTop = groupedWithPrev ? 'mt-0.5' : 'mt-3';

    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${marginTop}`}>
            <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : ''}`}>
                {!isMe && showAvatar && (
                    <div className="w-7 h-7 shrink-0">
                        {isLastOfGroup && senderAvatar ? (
                            <img
                                src={senderAvatar}
                                alt=""
                                className="w-7 h-7 rounded-full object-cover"
                            />
                        ) : null}
                    </div>
                )}
                <div className="flex flex-col">
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className={`${baseBubble} ${cornerClass} ${colorClass}`}
                    >
                        {(message.content_type === 'image' || message.type === 'image') &&
                        message.image_url ? (
                            <img
                                src={message.image_url}
                                alt=""
                                className="rounded-xl max-w-full max-h-72 object-cover -mx-1 -my-1"
                            />
                        ) : (
                            message.content
                        )}
                    </motion.div>
                    {isLastOfGroup && (
                        <span
                            className={`text-[10px] font-medium text-[#8B7E6D] mt-1 ${
                                isMe ? 'text-right mr-1' : 'text-left ml-1'
                            }`}
                        >
                            {formatTime(message.created_at || message.timestamp)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
