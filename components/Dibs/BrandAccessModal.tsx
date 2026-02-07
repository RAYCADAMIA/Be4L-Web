import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Sparkles } from 'lucide-react';
import { GlassCard, GradientButton, GlowText } from '../ui/AestheticComponents';
import { supabaseService } from '../../services/supabaseService';

interface BrandAccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const BrandAccessModal: React.FC<BrandAccessModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleVerify = async () => {
        if (!code.trim()) return;
        setLoading(true);
        setError('');

        try {
            const res = await supabaseService.auth.claimBrandAccess(code.replace(/\s/g, '').toUpperCase());
            if (res.success) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1500);
            } else {
                setError(res.error || 'Invalid Access Code');
            }
        } catch (err) {
            setError('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-deep-black/90 backdrop-blur-md"
            />

            <AnimatePresence mode="wait">
                <GlassCard className="relative w-full max-w-md overflow-hidden p-8 z-10 flex flex-col items-center text-center space-y-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center space-y-4 py-8"
                        >
                            <div className="w-20 h-20 rounded-full bg-electric-teal/20 flex items-center justify-center animate-pulse">
                                <Sparkles size={40} className="text-electric-teal" />
                            </div>
                            <div>
                                <GlowText size="lg" liquid>Brand Unlocked</GlowText>
                                <p className="text-gray-400 text-sm mt-2 uppercase tracking-widest">Welcome to the inner circle.</p>
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center shadow-2xl">
                                <ShieldCheck size={32} className="text-electric-teal drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-white tracking-tight">BRAND ACCESS</h2>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Enter your partner invite code</p>
                            </div>

                            <div className="w-full space-y-4">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        placeholder="ENTER-CODE-HERE"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-center text-white font-mono tracking-[0.2em] placeholder:text-gray-700 focus:outline-none focus:border-electric-teal/50 focus:shadow-[0_0_20px_rgba(45,212,191,0.1)] transition-all"
                                    />
                                </div>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                        className="text-red-500 text-xs font-bold uppercase tracking-wider"
                                    >
                                        {error}
                                    </motion.p>
                                )}

                                <GradientButton
                                    onClick={handleVerify}
                                    disabled={loading || !code}
                                    fullWidth
                                    className="h-12"
                                >
                                    {loading ? 'Verifying...' : 'Unlock Brand Account'}
                                </GradientButton>
                            </div>

                            <p className="text-[10px] text-gray-600 mt-4">
                                Don't have a code? Contact the administrator.
                            </p>
                        </>
                    )}
                </GlassCard>
            </AnimatePresence>
        </div>
    );
};
