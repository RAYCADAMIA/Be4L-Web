import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface WaitlistModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('submitting');

        // Mock API call
        setTimeout(() => {
            setStatus('success');
            // Reset after showing success for a bit
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setEmail('');
            }, 3000);
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        {/* Modal Container */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-deep-void/90 border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-cool-grey hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {/* Background Effects */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-electric-teal via-purple-500 to-electric-teal animate-liquid-bg" />
                            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-electric-teal/20 rounded-full blur-3xl pointer-events-none" />

                            {/* Content */}
                            <div className="relative z-10 text-center space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black font-display text-white uppercase tracking-tight">
                                        App Launching <span className="animate-liquid-text">Soon</span>
                                    </h3>
                                    <p className="text-cool-grey font-medium text-sm leading-relaxed">
                                        We are doing the final touches for the Be4L app for a more OBX experience.<br /><br />
                                        Join the waitlist to be among the first founding members and receive perks on your accounts 🤟
                                    </p>
                                </div>

                                {status === 'success' ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="py-8 flex flex-col items-center justify-center space-y-3"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center border border-green-500/50">
                                            <Check size={32} strokeWidth={3} />
                                        </div>
                                        <p className="text-white font-bold font-display tracking-widest uppercase">You're on the list!</p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2 text-left">
                                            <label className="text-xs font-bold text-cool-grey uppercase tracking-widest ml-1">Email Address</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="pogue@be4l.Life"
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-electric-teal/50 focus:bg-white/10 transition-all font-medium"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={status === 'submitting'}
                                            className="w-full py-4 bg-white text-deep-void font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest font-display relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {status === 'submitting' ? (
                                                <span className="animate-pulse">Adding you...</span>
                                            ) : (
                                                <span className="group-hover:animate-liquid-text transition-all">Join Beta Waitlist</span>
                                            )}
                                        </button>
                                    </form>
                                )}

                                <p className="text-[10px] text-cool-grey/60 font-medium">
                                    Limited spots available for the first wave.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
