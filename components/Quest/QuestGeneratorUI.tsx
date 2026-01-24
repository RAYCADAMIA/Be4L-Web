import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Zap, Shield, Trophy, X } from 'lucide-react';
import { Quest, QuestType } from '../../types';
import { GradientButton, GlassCard } from '../ui/AestheticComponents';
import { generateRandomQuests } from '../../utils/questGenerator';

interface QuestGeneratorUIProps {
    onAccept: (q: Quest) => void;
    onViewDetail: (q: Quest) => void;
    onClose: () => void;
}

const QuestGeneratorUI: React.FC<QuestGeneratorUIProps> = ({ onAccept, onViewDetail, onClose }) => {
    const [currentQuest, setCurrentQuest] = useState<Quest | null>(() => generateRandomQuests('All', new Date(), 1, QuestType.RANDOM)[0]);
    const [isRolling, setIsRolling] = useState(false);

    const handleRoll = () => {
        setIsRolling(true);
        setTimeout(() => {
            const next = generateRandomQuests('All', new Date(), 1, QuestType.RANDOM)[0];
            setCurrentQuest(next);
            setIsRolling(false);
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
            <GlassCard className="p-6 border-white/10 relative overflow-hidden bg-[#0a0a0a]/90 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/5">
                {/* Visual Accents */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[40px] -mr-12 -mt-12" />

                {/* Header Row */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                            <Zap size={16} className="fill-current" />
                        </div>
                        <div className="flex flex-col text-left">
                            <h2 className="text-sm font-black italic text-white uppercase tracking-tight leading-none mb-1">Random</h2>
                            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.15em] leading-none">Quest Generator</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                </div>

                {/* Quest Content */}
                <div className={`transition-all duration-300 ${isRolling ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100 blur-0'}`}>
                    <div className="flex flex-col items-center text-center">
                        <div className="px-2 py-0.5 bg-white/5 rounded-md border border-white/10 mb-3">
                            <span className="text-[8px] font-black uppercase text-primary tracking-widest leading-none">{currentQuest.category}</span>
                        </div>

                        <h3 className="text-xl font-black italic text-white uppercase leading-tight mb-3 px-2">{currentQuest.title}</h3>

                        <p className="text-[11px] text-gray-400 font-medium leading-relaxed mb-6 px-4">
                            "{currentQuest.description}"
                        </p>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black text-primary uppercase">+{currentQuest.aura_reward} Aura</span>
                            </div>
                            <div className="w-[1px] h-4 bg-white/10" />
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black text-secondary uppercase">+{currentQuest.exp_reward} EXP</span>
                            </div>
                        </div>

                        <div className="flex flex-col w-full gap-3">
                            <div className="flex w-full gap-2">
                                <button
                                    onClick={handleRoll}
                                    className="w-12 h-12 bg-surface hover:bg-white/5 rounded-xl border border-white/5 text-gray-400 transition-all flex items-center justify-center"
                                    title="Reroll"
                                >
                                    <RefreshCw size={16} className={isRolling ? 'animate-spin' : ''} />
                                </button>
                                <GradientButton onClick={() => onAccept(currentQuest)} fullWidth className="h-12 text-[10px] font-black italic uppercase tracking-widest shadow-[0_0_20px_rgba(204,255,0,0.2)]">
                                    Accept Quest
                                </GradientButton>
                            </div>

                            <button
                                onClick={() => onViewDetail(currentQuest)}
                                className="w-full py-2 text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center justify-center gap-2"
                            >
                                <div className="w-1 h-1 rounded-full bg-primary" />
                                See Full Details
                                <div className="w-1 h-1 rounded-full bg-primary" />
                            </button>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Minimal Sub-info */}
            <div className="mt-4 flex items-center justify-center gap-2 opacity-50">
                <Shield size={10} className="text-white" />
                <span className="text-[8px] font-bold text-white uppercase tracking-widest">Entry Level: {currentQuest.host.level}</span>
            </div>
        </motion.div>
    );
};

export default QuestGeneratorUI;
