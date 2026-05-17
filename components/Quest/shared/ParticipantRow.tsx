import React from 'react';
import { User } from '../../../types';

export type ParticipantAccent = 'host' | 'squad' | 'pending' | 'neutral';

interface ParticipantRowProps {
    user: Pick<User, 'id' | 'name' | 'handle' | 'username' | 'avatar_url'> & Partial<User>;
    subtitle?: React.ReactNode;
    trailing?: React.ReactNode;
    onClick?: () => void;
    accent?: ParticipantAccent;
    className?: string;
}

const ACCENT_RING: Record<ParticipantAccent, string> = {
    host: 'ring-2 ring-[#FF8C00]/60 shadow-[0_0_20px_rgba(255,140,0,0.3)]',
    squad: 'ring-1 ring-[#2DD4BF]/40',
    pending: 'ring-1 ring-white/10',
    neutral: 'ring-1 ring-white/5',
};

const ACCENT_EYEBROW: Record<ParticipantAccent, { label: string; className: string } | null> = {
    host: { label: 'Host', className: 'text-[#FFB854]' },
    squad: { label: 'Squad', className: 'text-[#2DD4BF]' },
    pending: { label: 'Pending', className: 'text-[#FFB854]' },
    neutral: null,
};

export const ParticipantRow: React.FC<ParticipantRowProps> = ({
    user,
    subtitle,
    trailing,
    onClick,
    accent = 'neutral',
    className = '',
}) => {
    const eyebrow = ACCENT_EYEBROW[accent];
    const handle = user.handle || user.username;

    const Inner = (
        <>
            <div className={`w-12 h-12 rounded-full overflow-hidden shrink-0 ${ACCENT_RING[accent]}`}>
                <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="min-w-0 flex-1">
                {eyebrow && (
                    <p
                        className={`text-[9px] font-black uppercase tracking-[0.2em] ${eyebrow.className} leading-none mb-1`}
                    >
                        {eyebrow.label}
                    </p>
                )}
                <p className="text-sm font-bold text-[#F5E6D3] truncate leading-tight">
                    {user.name}
                </p>
                {handle && (
                    <p className="text-[11px] font-medium text-[#8B7E6D] truncate leading-tight mt-0.5">
                        @{handle}
                    </p>
                )}
                {subtitle && (
                    <div className="text-[11px] font-medium text-[#8B7E6D] truncate mt-1">
                        {subtitle}
                    </div>
                )}
            </div>
            {trailing && <div className="shrink-0 flex items-center gap-2">{trailing}</div>}
        </>
    );

    const base = `flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 transition-colors ${className}`;

    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                className={`${base} text-left hover:bg-white/[0.04] hover:border-white/10 active:scale-[0.99]`}
            >
                {Inner}
            </button>
        );
    }

    return <div className={base}>{Inner}</div>;
};

export default ParticipantRow;
