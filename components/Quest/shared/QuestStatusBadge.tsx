import React from 'react';
import { motion } from 'framer-motion';
import { QuestStatus } from '../../../types';

interface QuestStatusBadgeProps {
    status: QuestStatus;
    className?: string;
}

export const QuestStatusBadge: React.FC<QuestStatusBadgeProps> = ({ status, className = '' }) => {
    const normalized = status || QuestStatus.DISCOVERABLE;

    let label = '';
    let container = '';
    let dot: React.ReactNode = null;

    switch (normalized) {
        case QuestStatus.ACTIVE:
        case QuestStatus.LOBBY:
            label = normalized === QuestStatus.LOBBY ? 'LOBBY' : 'LIVE';
            container = 'bg-red-500/10 border-red-500/30 text-red-300';
            dot = (
                <motion.span
                    aria-hidden
                    animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                />
            );
            break;
        case QuestStatus.COMPLETED:
            label = 'COMPLETED';
            container = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
            dot = <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-emerald-400" />;
            break;
        case QuestStatus.CANCELLED:
            label = 'CANCELLED';
            container = 'bg-white/5 border-white/10 text-[#8B7E6D]';
            dot = <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-[#8B7E6D]" />;
            break;
        case QuestStatus.DRAFT:
            label = 'DRAFT';
            container = 'bg-white/5 border-white/10 text-[#8B7E6D]';
            dot = <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-[#8B7E6D]" />;
            break;
        case QuestStatus.DISCOVERABLE:
        default:
            label = 'OPEN';
            container = 'bg-[#FF8C00]/10 border-[#FF8C00]/30 text-[#FFB854]';
            dot = <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-[#FFB854]" />;
            break;
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] ${container} ${className}`}
        >
            {dot}
            {label}
        </span>
    );
};

export default QuestStatusBadge;
