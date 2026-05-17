import React from 'react';

interface ChatListItemProps {
    avatarUrl?: string;
    name: string;
    preview?: string;
    timestamp?: string; // ISO or relative string
    unread?: boolean;
    active?: boolean;
    onClick?: () => void;
    trailing?: React.ReactNode;
    className?: string;
}

const formatRelative = (iso?: string): string => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const now = Date.now();
    const diff = now - d.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (diff < minute) return 'now';
    if (diff < hour) return `${Math.floor(diff / minute)}m`;
    if (diff < day) return `${Math.floor(diff / hour)}h`;
    if (diff < 7 * day) return `${Math.floor(diff / day)}d`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const ChatListItem: React.FC<ChatListItemProps> = ({
    avatarUrl,
    name,
    preview,
    timestamp,
    unread = false,
    active = false,
    onClick,
    trailing,
    className = '',
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all active:scale-[0.99] ${
                active
                    ? 'bg-white/[0.06] border border-white/10'
                    : 'bg-transparent border border-transparent hover:bg-white/[0.03] hover:border-white/5'
            } ${className}`}
        >
            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-white/5 border border-white/10">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#F5E6D3]/40 text-lg font-black">
                        {name.charAt(0)}
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <p
                        className={`text-sm truncate leading-tight ${
                            unread ? 'font-black text-[#F5E6D3]' : 'font-bold text-[#F5E6D3]'
                        }`}
                    >
                        {name}
                    </p>
                    {timestamp && (
                        <span
                            className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                unread ? 'text-[#2DD4BF]' : 'text-[#8B7E6D]'
                            }`}
                        >
                            {formatRelative(timestamp)}
                        </span>
                    )}
                </div>
                {preview && (
                    <div className="flex items-center justify-between gap-2 mt-1">
                        <p
                            className={`text-xs truncate leading-tight line-clamp-1 ${
                                unread ? 'text-[#F5E6D3]/80 font-medium' : 'text-[#8B7E6D]'
                            }`}
                        >
                            {preview}
                        </p>
                        {unread && (
                            <span
                                className="w-2 h-2 rounded-full bg-[#2DD4BF] shrink-0 shadow-[0_0_10px_rgba(45,212,191,0.6)]"
                                aria-label="Unread"
                            />
                        )}
                        {trailing}
                    </div>
                )}
            </div>
        </button>
    );
};

export default ChatListItem;
