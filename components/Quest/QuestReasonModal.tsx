import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestReasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    type: 'ACCEPT' | 'DECLINE';
    userName: string;
}

const QuestReasonModal: React.FC<QuestReasonModalProps> = ({ isOpen, onClose, onConfirm, type, userName }) => {
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
                    className="relative w-full max-w-[320px] bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
                >
                    <div className="p-10 space-y-8">
                        <div className="space-y-2 text-center">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                                Are you sure?
                            </h3>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                                {type === 'ACCEPT' ? `Accepting ${userName}` : `Declining ${userName}`}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all bg-white/[0.03] hover:bg-white/[0.08] hover:scale-[1.02] active:scale-95"
                            >
                                cancel
                            </button>
                            <button
                                onClick={() => onConfirm(type === 'ACCEPT' ? 'Accepted' : 'Declined')}
                                className={`flex-1 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 ${type === 'ACCEPT' ? 'bg-emerald-500 text-black shadow-[0_10px_20px_rgba(16,185,129,0.2)]' : 'bg-red-500 text-white shadow-[0_10px_20px_rgba(239,68,68,0.2)]'}`}
                            >
                                YES
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default QuestReasonModal;
