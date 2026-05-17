import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Sparkles, Ticket } from 'lucide-react';
import { User } from '../../../types';

interface InvitationPreviewProps {
    host?: Pick<User, 'name' | 'avatar_url' | 'handle' | 'username'> | null;
    title: string;
    description?: string;
    category?: string;
    whenLabel?: string;
    whereLabel?: string;
    vibeTags?: string[];
    capacity?: number | null;
    visibilityLabel?: string;
    linkedDibsLabel?: string | null;
    className?: string;
}

export const InvitationPreview: React.FC<InvitationPreviewProps> = ({
    host,
    title,
    description,
    category,
    whenLabel,
    whereLabel,
    vibeTags,
    capacity,
    visibilityLabel,
    linkedDibsLabel,
    className = '',
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0E0C0B] shadow-[0_30px_80px_rgba(0,0,0,0.5)] ${className}`}
        >
            {/* Warm dusk header */}
            <div className="relative px-7 pt-8 pb-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF8C00] via-[#E34234] to-[#800020]" />
                <motion.div
                    aria-hidden
                    className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-[#FFB854]/40 blur-[80px]"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/60 mb-4">
                        Invitation
                    </p>
                    <div className="flex items-center gap-3 mb-6">
                        {host?.avatar_url && (
                            <img
                                src={host.avatar_url}
                                alt={host.name}
                                className="w-10 h-10 rounded-full border-2 border-black/20 object-cover"
                            />
                        )}
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black/70 leading-none">
                                {host?.name || 'You'}
                            </p>
                            <p className="text-[10px] font-medium text-black/50 mt-1">
                                is inviting the squad to…
                            </p>
                        </div>
                    </div>
                    <h2 className="font-display font-black uppercase tracking-tighter leading-[0.9] text-black text-3xl md:text-4xl break-words">
                        {title || 'Your next mission'}
                    </h2>
                    {category && (
                        <span className="inline-block mt-4 px-3 py-1 rounded-full bg-black/20 text-[9px] font-black uppercase tracking-[0.2em] text-black">
                            {category}
                        </span>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="p-7 space-y-5">
                {description && (
                    <p className="text-sm text-[#F5E6D3]/80 leading-relaxed">{description}</p>
                )}

                <div className="grid grid-cols-1 gap-3">
                    {whenLabel && (
                        <InfoRow icon={<Calendar size={14} />} label="WHEN" value={whenLabel} />
                    )}
                    {whereLabel && (
                        <InfoRow icon={<MapPin size={14} />} label="WHERE" value={whereLabel} />
                    )}
                    <InfoRow
                        icon={<Users size={14} />}
                        label="GUESTLIST"
                        value={`${visibilityLabel || 'Public'}${
                            capacity ? ` · up to ${capacity}` : ' · unlimited'
                        }`}
                    />
                    {linkedDibsLabel && (
                        <InfoRow
                            icon={<Ticket size={14} />}
                            label="BOOKING"
                            value={linkedDibsLabel}
                        />
                    )}
                </div>

                {vibeTags && vibeTags.length > 0 && (
                    <div className="pt-3 border-t border-white/5">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B7E6D] mb-2 flex items-center gap-1.5">
                            <Sparkles size={10} /> Vibe
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {vibeTags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 rounded-full bg-[#FF8C00]/10 border border-[#FF8C00]/30 text-[10px] font-black uppercase tracking-[0.15em] text-[#FFB854]"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({
    icon,
    label,
    value,
}) => (
    <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-[#FFB854] shrink-0">
            {icon}
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B7E6D] leading-none">
                {label}
            </p>
            <p className="text-sm font-medium text-[#F5E6D3] mt-1 truncate">{value}</p>
        </div>
    </div>
);

export default InvitationPreview;
