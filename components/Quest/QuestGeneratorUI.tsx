import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Zap, Shield, Trophy, X } from 'lucide-react';
import { Quest, QuestType } from '../../types';
import { GradientButton, GlassCard } from '../ui/AestheticComponents';
import { generateRandomQuests } from '../../utils/questGenerator';

interface QuestGeneratorUIProps {
    onAccept: (q: Quest) => void;
    onViewDetail: (q: Quest) => void;
    onClose?: () => void;
    showClose?: boolean;
}

const QuestGeneratorUI: React.FC<QuestGeneratorUIProps> = ({ onAccept, onViewDetail, onClose, showClose = true }) => {
    const [currentQuest, setCurrentQuest] = useState<Quest | null>(() => generateRandomQuests('All', new Date(), 1, QuestType.RANDOM)[0]);
    const [isRolling, setIsRolling] = useState(false);
    const [retries, setRetries] = useState(5);

    const handleRoll = () => {
        if (retries <= 0) return;

        setIsRolling(true);
        setTimeout(() => {
            const next = generateRandomQuests('All', new Date(), 1, QuestType.RANDOM)[0];
            setCurrentQuest(next);
            setIsRolling(false);
            setRetries(prev => prev - 1);
        }, 800);
    };

    if (!currentQuest) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-sm mx-auto p-4"
        >
            <GlassCard className="p-8 border-white/10 relative overflow-hidden bg-[#0a0a0a]/90 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/5 min-h-[420px] flex flex-col">
                {/* Visual Accents */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-16 -mt-16" />

                {/* Header with Title */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Random</h2>
                        <h3 className="text-sm font-black italic uppercase tracking-tighter text-white">Quest Generator</h3>
                    </div>
                    {showClose && (
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Quest Content */}
                <div className={`flex-1 flex flex-col justify-center transition-all duration-300 ${isRolling ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100 blur-0'}`}>
                    <div className="flex flex-col items-center text-center">
                        <h3 className="text-2xl font-black italic text-white uppercase leading-tight mb-4 px-2">
                            {currentQuest.title}
                        </h3>

                        <p className="text-[12px] text-gray-400 font-medium leading-relaxed mb-10 px-4 opacity-70">
                            {currentQuest.description}
                        </p>

                        <div className="flex flex-col w-full gap-4 pt-6 border-t border-white/5">
                            <div className="flex flex-col items-center gap-3 mb-2">
                                <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${retries > 0 ? 'text-primary/60' : 'text-red-500/60'}`}>
                                    {retries} remaining out of 5 tries
                                </span>
                            </div>

                            <div className="flex w-full gap-3">
                                <button
                                    onClick={handleRoll}
                                    disabled={retries <= 0 || isRolling}
                                    className={`w-14 h-14 rounded-2xl border transition-all flex items-center justify-center group ${retries > 0
                                            ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                                            : 'bg-red-500/5 border-red-500/10 text-red-500/30 cursor-not-allowed'
                                        }`}
                                    title="Reroll"
                                >
                                    <RefreshCw size={18} className={`${isRolling ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                                </button>
                                <GradientButton onClick={() => onAccept(currentQuest)} fullWidth className="h-14 text-[10px] font-black italic uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(204,255,0,0.15)]">
                                    Add to Quests List
                                </GradientButton>
                            </div>

                            <button
                                onClick={() => onViewDetail(currentQuest)}
                                className="w-full py-2 text-[8px] font-black text-gray-600 uppercase tracking-[0.3em] hover:text-white transition-colors flex items-center justify-center gap-3"
                            >
                                <div className="w-1 h-1 rounded-full bg-primary/40" />
                                Inspect Mission
                                <div className="w-1 h-1 rounded-full bg-primary/40" />
                            </button>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};

export default QuestGeneratorUI;
