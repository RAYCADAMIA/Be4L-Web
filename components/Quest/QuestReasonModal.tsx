import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Shield, AlertCircle, Send } from 'lucide-react';
import { GradientButton } from '../ui/AestheticComponents';

interface QuestReasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    type: 'ACCEPT' | 'DECLINE';
    userName: string;
}

const QuestReasonModal: React.FC<QuestReasonModalProps> = ({ isOpen, onClose, onConfirm, type, userName }) => {
    const [reason, setReason] = useState('');
    const [selectedQuickReason, setSelectedQuickReason] = useState<string | null>(null);
    const [isOther, setIsOther] = useState(false);

    const declineReasons = [
        "Maybe next time!",
        "Need a bit more info on your profile",
        "Doesn't quite match the quest requirements",
        "Aura score too low"
    ];

    const handleQuickSelect = (r: string) => {
        setSelectedQuickReason(r);
        setIsOther(false);
        setReason('');
    };

    const handleOtherSelect = () => {
        setIsOther(true);
        setSelectedQuickReason(null);
    };

    const handleConfirm = () => {
        const finalReason = isOther ? reason : (selectedQuickReason || (type === 'ACCEPT' ? 'Cleared for deployment.' : 'No reason specified.'));
        onConfirm(finalReason);
        setReason('');
        setSelectedQuickReason(null);
        setIsOther(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 10 }}
                    className="relative w-full max-w-[320px] bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden"
                >
                    <div className="p-8 space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                {type === 'ACCEPT' ? 'Mission Clear' : 'Decline request'}
                            </h3>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] leading-none">
                                {type === 'ACCEPT' ? 'intel log' : 'select reason'}
                            </p>
                        </div>

                        <div className="space-y-1">
                            {type === 'DECLINE' ? (
                                <>
                                    {declineReasons.map((r) => {
                                        const isSelected = selectedQuickReason === r;
                                        return (
                                            <button
                                                key={r}
                                                onClick={() => handleQuickSelect(r)}
                                                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group"
                                            >
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-red-500 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-white/10 group-hover:border-white/20'}`}>
                                                    {isSelected && <Check size={12} strokeWidth={4} className="text-white" />}
                                                </div>
                                                <span className={`text-[11px] font-bold transition-all text-left ${isSelected ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>
                                                    {r}
                                                </span>
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={handleOtherSelect}
                                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group"
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isOther ? 'bg-red-500 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-white/10 group-hover:border-white/20'}`}>
                                            {isOther && <Check size={12} strokeWidth={4} className="text-white" />}
                                        </div>
                                        <span className={`text-[11px] font-bold transition-all text-left ${isOther ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>
                                            Other
                                        </span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => handleQuickSelect('Welcome Hunter')}
                                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group"
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${selectedQuickReason === 'Welcome Hunter' ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-white/10 group-hover:border-white/20'}`}>
                                        {selectedQuickReason === 'Welcome Hunter' && <Check size={12} strokeWidth={4} className="text-black" />}
                                    </div>
                                    <span className={`text-[11px] font-bold transition-all text-left ${selectedQuickReason === 'Welcome Hunter' ? 'text-emerald-500' : 'text-white/40 group-hover:text-white/60'}`}>
                                        Clear for Deployment
                                    </span>
                                </button>
                            )}

                            <AnimatePresence>
                                {(isOther || type === 'ACCEPT') && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden pt-2 px-4"
                                    >
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="..."
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white text-xs focus:outline-none focus:border-white/10 transition-all min-h-[80px] resize-none"
                                            autoFocus
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all bg-white/[0.02] hover:bg-white/[0.05]"
                            >
                                cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={type === 'DECLINE' && !selectedQuickReason && !isOther}
                                className={`flex-1 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'ACCEPT' ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white shadow-[0_10px_20px_rgba(239,68,68,0.2)]'} disabled:opacity-20`}
                            >
                                confirm
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default QuestReasonModal;
