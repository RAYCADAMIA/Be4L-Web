import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Share2 } from 'lucide-react';
import { Quest } from '../../../types';
import QuestStatusBadge from './QuestStatusBadge';
import QuestVisibilityIcon from './QuestVisibilityIcon';

interface QuestHeroHeaderProps {
    quest: Quest;
    onBack?: () => void;
    onShare?: () => void;
    trailing?: React.ReactNode;
}

export const QuestHeroHeader: React.FC<QuestHeroHeaderProps> = ({
    quest,
    onBack,
    onShare,
    trailing,
}) => {
    const image = quest.image_url || quest.host_capture_url;
    const category = quest.category || 'SOCIAL';

    return (
        <div className="relative overflow-hidden rounded-b-[2.5rem] md:rounded-[2.5rem] md:mt-6 md:mx-6">
            {/* Image or warm dusk fallback */}
            <div className="relative aspect-[4/3] md:aspect-[21/9] w-full">
                {image ? (
                    <img
                        src={image}
                        alt={quest.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF8C00] via-[#E34234] to-[#800020]" />
                )}

                {/* Warm dusk gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080707] via-[#080707]/70 to-[#080707]/20" />

                {/* Ambient blur orb for vibe */}
                <motion.div
                    aria-hidden
                    className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-[#FF8C00]/20 blur-[80px]"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Top controls */}
                <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2 z-10">
                    {onBack && (
                        <button
                            onClick={onBack}
                            aria-label="Back"
                            className="p-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-[#F5E6D3] hover:bg-black/60 transition-all active:scale-95"
                        >
                            <ChevronLeft size={18} />
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        {trailing}
                        {onShare && (
                            <button
                                onClick={onShare}
                                aria-label="Share"
                                className="p-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-[#F5E6D3] hover:bg-black/60 transition-all active:scale-95"
                            >
                                <Share2 size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Title block */}
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 z-10">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <QuestStatusBadge status={quest.status} />
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-[#F5E6D3]/70 backdrop-blur-xl">
                            <QuestVisibilityIcon scope={quest.visibility_scope} size={10} />
                            {quest.visibility_scope || 'public'}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-[#FF8C00]/10 border border-[#FF8C00]/30 text-[9px] font-black uppercase tracking-[0.2em] text-[#FFB854]">
                            {category}
                        </span>
                    </div>
                    <h1 className="font-display font-black uppercase tracking-tighter leading-[0.9] text-[#F5E6D3] text-3xl md:text-6xl break-words">
                        {quest.title}
                    </h1>
                    {quest.host?.name && (
                        <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8B7E6D]">
                            Hosted by <span className="text-[#F5E6D3]">{quest.host.name}</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestHeroHeader;
